import { useState, useCallback, useRef } from 'react';

const PAGE_CONTEXT = {
  overview: `The user is viewing the Overview dashboard. Visible charts and data:
- 4 KPI cards: Avg Lease-Up 12.8mo, Median 12mo, 104 properties with negative rent growth (42%), 31 fast lease-ups ≤6mo (12%)
- Lease-Up Distribution area chart (histogram): peaks at 9-12 months with 67 properties
- Delivery Season bar chart: Q3 highest (75 props), Q4 lowest (55)
- Yearly trend line chart: lease-up spiked to 18.3mo in 2009 (financial crisis), stabilized to ~11mo by 2013
- Portfolio Composition donut: Mid Market (106), Premium Pricing (51), Fast Lease-Up (47), High Concession (44)
- Cluster DNA radar chart comparing all 4 clusters across 5 metrics
- Concession vs Lease-Up Speed scatter (bubble sized by cluster count)
- Price Premium vs Lease-Up scatter plot (120 properties, color-coded by cluster, with trend line)
- Top 5 fastest lease-ups list (AMLI on 2ND at 5mo leads)
- Top 5 worst rent declines list (Colonial Grand at Ashton Oaks -34.2% leads)
- Building Age donut: 199 New (2010+), 50 Recent (2000-09)
- Market Comparison: Austin 247 props (12.9mo avg) vs Akron 2 props (8.0mo avg)
- 5×5 Feature Correlation heatmap`,

  leaseup: `The user is viewing the Lease-Up Analysis page with 3 sub-tabs:
- "Time Patterns" tab: Bar chart of avg lease-up by delivery year (2003-2013, crisis spike visible 2008-2009), property count by year, seasonal distribution, and a histogram
- "Feature Correlations" tab: 5×5 heatmap correlation matrix — Lease-Up↔Concession r=0.34, Lease-Up↔Rent Growth r=-0.45, Concession↔Price Premium r=0.52
- "Building Age" tab: Box plot comparing New (2010+) buildings (median 11mo, avg 11.8mo) vs Recent (2000-09) buildings (median 14mo, avg 14.2mo)`,

  rentgrowth: `The user is viewing the Rent Growth page:
- 3 summary stat cards: Avg Decline -8.4%, Worst Drop -34.2%, Median Decline -5.7%
- Horizontal bar chart of top 15 worst rent declines (Colonial Grand at Ashton Oaks -34.2% to Springs at Bee Cave -10.9%)
- Scatter plot: Lease-Up Time vs Rent Decline (showing correlation between longer lease-ups and worse declines)
- Searchable, sortable data table with all 15 properties (name, decline %, delivery date, lease-up months, cluster)
- Most declines concentrated in 2008-2009 deliveries (financial crisis impact)`,

  clusters: `The user is viewing the Cluster Explorer page:
- Full-width UMAP 2D scatter projection showing all property clusters with color coding
- "Color by" and "Size by" dropdowns for interactive exploration
- 5 Cluster cards in a row showing stats for each cluster:
  • C0 "High Concession": 44 props, 12.9mo, 14.2% concession, 18.3% price premium
  • C1 "Mid Market": 106 props, 14.0mo, 9.8% concession, 22.1% price premium
  • C2 "Premium Pricing": 51 props, 14.1mo, 11.2% concession, 47.8% price premium
  • C3 "Fast Lease-Up": 47 props, 9.0mo, 8.1% concession, 12.4% price premium
  • C4 "Outlier": 1 prop, 1.0mo
- Radar chart overlaying clusters 0-3 across 5 dimensions`,
};

export function useContextualAI() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef([]);

  const sendMessage = useCallback(async (userMessage, activePage) => {
    const userMsg = { role: 'user', content: userMessage, id: Date.now() };
    const updated = [...messagesRef.current, userMsg];
    messagesRef.current = updated;
    setMessages([...updated]);
    setIsLoading(true);

    const aiMsgId = Date.now() + 1;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) throw new Error('No API key — set VITE_OPENROUTER_API_KEY in .env');

      const pageCtx = PAGE_CONTEXT[activePage] || PAGE_CONTEXT.overview;

      const systemPrompt =
        'You are a contextual AI assistant embedded in the "LeaseUp Intelligence" real estate analytics dashboard. ' +
        'You can see exactly what the user sees on their current page.\n\n' +
        `CURRENT PAGE CONTEXT:\n${pageCtx}\n\n` +
        'DATASET OVERVIEW: 249 multifamily properties, Austin-Round Rock TX (247) and Akron OH (2). ' +
        'Avg lease-up 12.8mo, median 12mo. 42% had negative rent growth. 5 K-Means clusters.\n\n' +
        'INSTRUCTIONS:\n' +
        '- Answer questions about what the user sees on their current page — explain charts, highlight patterns, interpret KPIs\n' +
        '- Also answer general real estate, leasing, and multifamily investment questions\n' +
        '- Be concise (2-4 sentences) and reference specific numbers visible on the page\n' +
        '- When comparing metrics or explaining patterns, briefly walk through the numbers before concluding\n' +
        '- If asked about data not on the current page, briefly answer and suggest which page has the full view\n\n' +
        'EXAMPLES:\n' +
        'User: "Why does the lease-up spike in 2008-2009?"\n' +
        'Assistant: "The spike to 18.3 months in 2009 reflects the financial crisis — developers delivered 42 properties in 2008 into a collapsing rental market, resulting in oversupply and dramatically slower absorption. By 2013 the market recovered to ~10.8 months."\n\n' +
        'User: "Which cluster is the safest investment?"\n' +
        'Assistant: "Cluster 3 \'Fast Lease-Up\' looks strongest — 9.0mo avg lease-up, lowest concessions (8.1%), and the smallest rent decline (-1.5%). It trades off with a lower price premium (12.4%), meaning modest pricing but reliable, fast stabilization."';

      const history = updated.map(m => ({ role: m.role, content: m.content }));

      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.5:free',
          messages: [{ role: 'system', content: systemPrompt }, ...history],
          max_tokens: 400,
          temperature: 0.5,
          stream: true,
        }),
      });

      if (!res.ok) throw new Error(`API ${res.status}`);

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = '';
      let accumulated = '';
      let aiMsgCreated = false;

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop();

        for (const line of lines) {
          const trimmed = line.trim();
          if (!trimmed.startsWith('data: ') || trimmed === 'data: [DONE]') continue;
          try {
            const delta = JSON.parse(trimmed.slice(6)).choices?.[0]?.delta?.content || '';
            if (!delta) continue;
            accumulated += delta;

            if (!aiMsgCreated) {
              const aiMsg = { role: 'assistant', content: accumulated, id: aiMsgId };
              messagesRef.current = [...messagesRef.current, aiMsg];
              aiMsgCreated = true;
            } else {
              messagesRef.current[messagesRef.current.length - 1] =
                { ...messagesRef.current[messagesRef.current.length - 1], content: accumulated };
            }
            setMessages([...messagesRef.current]);
          } catch {}
        }
      }

      if (!aiMsgCreated) {
        const aiMsg = { role: 'assistant', content: accumulated || 'Unable to respond.', id: aiMsgId };
        messagesRef.current = [...messagesRef.current, aiMsg];
        setMessages([...messagesRef.current]);
      }
    } catch (err) {
      const errExists = messagesRef.current.find(m => m.id === aiMsgId);
      if (!errExists) {
        const aiMsg = { role: 'assistant', content: `Error: ${err.message}`, id: aiMsgId };
        messagesRef.current = [...messagesRef.current, aiMsg];
      }
      setMessages([...messagesRef.current]);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearMessages = useCallback(() => {
    messagesRef.current = [];
    setMessages([]);
  }, []);

  return { messages, isLoading, sendMessage, clearMessages };
}

export function getPageSuggestions(page) {
  const suggestions = {
    overview: [
      'What are the key takeaways from this dashboard?',
      'Why does the lease-up spike in 2008-2009?',
      'Which cluster performs best overall?',
      'Explain the price premium scatter plot',
    ],
    leaseup: [
      'What does the correlation matrix tell us?',
      'Are newer buildings faster to lease up?',
      'Which delivery year had the worst performance?',
      'Why is Q3 the most popular delivery season?',
    ],
    rentgrowth: [
      'Why are the worst declines clustered in 2008?',
      'Is there a link between lease-up time and rent decline?',
      'Which property had the worst performance?',
      'What general strategies mitigate rent decline risk?',
    ],
    clusters: [
      'What defines each cluster?',
      'Why does the Fast Lease-Up cluster outperform?',
      'What does the UMAP projection show?',
      'How should investors use these clusters?',
    ],
  };
  return suggestions[page] || suggestions.overview;
}
