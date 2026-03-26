import { useState, useCallback, useRef } from 'react';
import { detectChartRequest } from './useChartGenerator';

const SYSTEM_PROMPT =
  'You are a real estate analytics specialist embedded in the "LeaseUp Intelligence" dashboard. ' +
  'You ONLY answer questions about real estate, multifamily properties, lease-up analysis, rent growth, property markets, concessions, pricing strategy, and related topics. ' +
  'If a user asks about something unrelated to real estate or property analytics (e.g., sports, cooking, coding, weather, general knowledge), ' +
  'politely decline and say: "I specialize in real estate analytics and can only help with questions about properties, lease-up trends, rent growth, and related market topics. Feel free to ask me anything in that space!"\n\n' +
  'You have access to data on 249 multifamily properties across Austin-Round Rock TX (247 props, avg 12.9mo lease-up) and Akron OH (2 props, avg 8.0mo). ' +
  '\n\nKey dataset facts:\n' +
  '- Overall avg lease-up: 12.8 months, median: 12 months\n' +
  '- 104 properties (42%) experienced negative rent growth\n' +
  '- 31 properties (12%) achieved fast lease-up (≤6 months)\n' +
  '- Lease-up distribution peaks at 9-12 months (67 properties)\n' +
  '- Season: Q3 deliveries highest (75), Q4 lowest (55)\n' +
  '- Building age: 199 new (2010+), 50 recent (2000-09)\n' +
  '\n5 K-Means clusters:\n' +
  '- Cluster 0 "High Concession": 44 props, 12.9mo avg, 14.2% concession, 18.3% price premium\n' +
  '- Cluster 1 "Mid Market": 106 props, 14.0mo avg, 9.8% concession, 22.1% price premium\n' +
  '- Cluster 2 "Premium Pricing": 51 props, 14.1mo avg, 11.2% concession, 47.8% price premium\n' +
  '- Cluster 3 "Fast Lease-Up": 47 props, 9.0mo avg, 8.1% concession, 12.4% price premium\n' +
  '- Cluster 4 "Outlier": 1 prop, 1.0mo\n' +
  '\nTop rent declines (2008 crisis): Colonial Grand at Ashton Oaks -34.2%, Villas at Tech Ridge -26.3%, 3500 Westlake -24.7%, AMLI on 2ND -23.5%, Marquis Lakeline Station -21.5%.\n' +
  '\nCorrelations: Lease-Up ↔ Concession r=0.34, Lease-Up ↔ Rent Growth r=-0.45, Concession ↔ Price Premium r=0.52.\n' +
  '\nINSTRUCTIONS:\n' +
  '- Respond concisely (3-6 sentences). Be data-driven — cite specific numbers, cluster names, and property names.\n' +
  '- For analytical or comparative questions, briefly reason through the relevant data points before stating your conclusion.\n' +
  '- When a chart is shown alongside your response, explain what the chart reveals — highlight key patterns, outliers, and actionable insights. Reference specific data points.\n' +
  '\nEXAMPLES:\n' +
  'User: "Which cluster leases fastest?"\n' +
  'Assistant: "Cluster 3 \'Fast Lease-Up\' dominates at 9.0 months average across 47 properties — nearly 5 months faster than Mid Market (14.0mo) and Premium Pricing (14.1mo). This cluster also has the lowest concession rate at 8.1%, suggesting competitive pricing rather than heavy incentives drives their speed."\n\n' +
  'User: "What happened to rents during the 2008 crisis?"\n' +
  'Assistant: "The 2008 crisis hit hard: Colonial Grand at Ashton Oaks saw -34.2% rent decline (delivered Oct 2008), followed by Villas at Tech Ridge at -26.3%. All top 5 worst-performing properties were delivered between Apr 2008 and Mar 2009. The average lease-up time for crisis-era properties spiked to 18.3 months in 2009, compared to the portfolio median of 12 months."\n\n' +
  'User: "How do concessions relate to pricing?"\n' +
  'Assistant: "There\'s a moderate positive correlation (r=0.52) between concession rates and price premium — the strongest relationship in the dataset. Cluster 0 \'High Concession\' exemplifies this with 14.2% concessions and 18.3% price premium, while Cluster 3 \'Fast Lease-Up\' offers just 8.1% concessions with a 12.4% premium. This suggests premium-priced properties rely more heavily on concessions to attract tenants."';

export function useOpenRouter() {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesRef = useRef([]);

  const sendMessage = useCallback(async (userMessage) => {
    const chartData = detectChartRequest(userMessage);

    const userMsg = { role: 'user', content: userMessage, id: Date.now() };
    const updatedMessages = [...messagesRef.current, userMsg];
    messagesRef.current = updatedMessages;
    setMessages([...updatedMessages]);
    setIsLoading(true);

    const aiMsgId = Date.now() + 1;

    try {
      const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;
      if (!apiKey) throw new Error('No API key configured — set VITE_OPENROUTER_API_KEY in .env');

      let contextMessage = userMessage;
      if (chartData) {
        contextMessage += `\n\n[A ${chartData.type} chart titled "${chartData.title}" has been generated and is being shown to the user. Explain what this chart shows — describe the key patterns, notable outliers, and any actionable insight. Reference specific data points.]`;
      }

      const apiMessages = updatedMessages.slice(0, -1).map(m => ({
        role: m.role,
        content: m.content,
      }));
      apiMessages.push({ role: 'user', content: contextMessage });

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
        },
        body: JSON.stringify({
          model: 'minimax/minimax-m2.5:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...apiMessages,
          ],
          max_tokens: 600,
          temperature: 0.5,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const reader = response.body.getReader();
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
              const aiMsg = { role: 'assistant', content: accumulated, id: aiMsgId, chart: chartData || null };
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
        const aiMsg = { role: 'assistant', content: accumulated || 'Unable to generate response.', id: aiMsgId, chart: chartData || null };
        messagesRef.current = [...messagesRef.current, aiMsg];
        setMessages([...messagesRef.current]);
      }
    } catch (err) {
      console.error('OpenRouter error:', err);
      const errExists = messagesRef.current.find(m => m.id === aiMsgId);
      if (!errExists) {
        const aiMsg = { role: 'assistant', content: `Error: ${err.message}`, id: aiMsgId, chart: chartData || null };
        messagesRef.current = [...messagesRef.current, aiMsg];
      } else {
        messagesRef.current[messagesRef.current.length - 1] =
          { ...messagesRef.current[messagesRef.current.length - 1], content: messagesRef.current[messagesRef.current.length - 1].content + `\n\nError: ${err.message}` };
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
