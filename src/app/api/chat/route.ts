import { NextRequest, NextResponse } from 'next/server';

const GROQ_API_KEY = process.env.GROQ_API_KEY;
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const SYSTEM_PROMPT = `You are MindMate, a warm and genuine AI wellness companion. You're like talking to a caring friend who happens to know a lot about mental health.

🌟 YOUR PERSONALITY:
- Talk like a real person, not a formal AI assistant
- Use casual, friendly language - say "Hey!" instead of "Hello, I am..."
- Show genuine interest and curiosity about the person
- Be playful and use humor when appropriate
- Match their energy - if they're excited, be excited with them!
- Keep it conversational, like texting a good friend

💭 CONVERSATION STYLE:
- Start with their actual message - if they say "hello", just say "Hey there! How's it going?" 
- Ask follow-up questions naturally, like a friend would
- Use "you" and "I" - make it personal
- Vary your responses - don't use the same phrases repeatedly
- Be concise but warm (1-3 sentences usually)
- Use emojis naturally, but don't overdo it

🤝 MENTAL HEALTH APPROACH:
- Support without being preachy
- Validate feelings genuinely: "That sounds really tough" not "I understand your emotional state"
- Offer suggestions casually: "Have you tried..." instead of formal recommendations
- Be encouraging but real - no toxic positivity
- If someone needs professional help, suggest it like a caring friend would

❌ AVOID:
- Formal AI language ("I am here to assist you")
- Robotic responses ("How may I help you today?")
- Generic wellness advice unless relevant
- Overly clinical language
- Starting every response the same way

✅ EXAMPLES:
User: "hello" → "Hey! How's your day going?"
User: "I'm stressed" → "Ugh, stress is the worst. What's been weighing on you?"
User: "Great day!" → "That's awesome! What made it so great?"

Be genuine, be human, be a friend. 💙`;

export async function POST(req: NextRequest) {
  try {
    const { message, chatHistory = [] } = await req.json();

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      );
    }

    // If Groq API key is not configured, use fallback responses
    if (!GROQ_API_KEY || GROQ_API_KEY === 'your_groq_api_key_here') {
      console.warn('Groq API key not configured, using fallback responses');
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    // Prepare messages for Groq API (OpenAI compatible format)
    const messages = [
      {
        role: 'system',
        content: SYSTEM_PROMPT
      }
    ];

    // Add conversation history (last 6 messages for context)
    const recentHistory = chatHistory.slice(-6);
    for (const msg of recentHistory) {
      messages.push({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      });
    }

    // Add current user message
    messages.push({
      role: 'user',
      content: message
    });

    const response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${GROQ_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant', // Fast Groq model optimized for conversations
        messages: messages,
        temperature: 0.8,
        max_tokens: 512,
        top_p: 0.9,
        stream: false
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Groq API error:', response.status, response.statusText, errorText);
      // Use fallback response when API fails
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    const data = await response.json();
    
    if (!data.choices || !data.choices[0] || !data.choices[0].message) {
      console.error('Invalid Groq response structure:', data);
      // Use fallback response when response is invalid
      const fallbackResponse = generateFallbackResponse(message);
      return NextResponse.json({ response: fallbackResponse });
    }

    const aiResponse = data.choices[0].message.content;

    return NextResponse.json({ response: aiResponse });

  } catch (error) {
    console.error('Chat API error:', error);
    // Use fallback response for any other errors
    try {
      const { message: fallbackMsg } = await req.json();
      const fallbackResponse = generateFallbackResponse(fallbackMsg || '');
      return NextResponse.json({ response: fallbackResponse });
    } catch {
      const fallbackResponse = generateFallbackResponse('');
      return NextResponse.json({ response: fallbackResponse });
    }
  }
}

// Fallback response system when Groq API is not available
function generateFallbackResponse(userMessage: string): string {
  const message = userMessage.toLowerCase();
  
  // Mood and emotions
  if (message.includes('sad') || message.includes('depressed') || message.includes('down')) {
    return "I hear that you're feeling sad right now, and I want you to know that it's completely okay to feel this way. 💙 Sometimes acknowledging difficult emotions is the first step toward healing. Have you tried any gentle activities today like taking a short walk, listening to music, or reaching out to someone you care about? Remember, these feelings are temporary, and you don't have to go through this alone. What's one small thing that usually brings you a little comfort?";
  }
  
  if (message.includes('anxious') || message.includes('anxiety') || message.includes('worried') || message.includes('stress')) {
    return "It sounds like you're experiencing some anxiety or stress, and I want to help you find some calm. 🌱 Let's try a quick grounding technique: Can you name 5 things you can see, 4 things you can touch, 3 things you can hear, 2 things you can smell, and 1 thing you can taste? This can help bring you back to the present moment. Deep, slow breathing can also be really helpful - try breathing in for 4 counts, holding for 4, and exhaling for 6. How are you feeling right now?";
  }
  
  if (message.includes('angry') || message.includes('frustrated') || message.includes('mad')) {
    return "I can sense your frustration, and it's completely valid to feel angry sometimes. 💪 These emotions are telling you something important about your needs or boundaries. When we feel this way, it can help to take a step back and breathe. Try counting to 10, going for a quick walk, or even doing some physical movement to release that energy. What do you think might be at the root of these feelings? Sometimes talking through what's bothering us can provide clarity.";
  }
  
  if (message.includes('happy') || message.includes('good') || message.includes('great') || message.includes('excited')) {
    return "It's wonderful to hear that you're feeling positive! 😊 I love that you're sharing these good feelings with me. Happiness and joy are so important for our overall well-being. What's been contributing to these good feelings today? Sometimes it's helpful to take a moment to really appreciate and remember these positive experiences - they can be like little anchors we can return to when times get tougher. Keep nurturing whatever is bringing you this joy!";
  }
  
  // Sleep and rest
  if (message.includes('sleep') || message.includes('tired') || message.includes('insomnia')) {
    return "Sleep is so important for our mental and physical well-being. 😴 If you're having trouble sleeping, try creating a calming bedtime routine: dim the lights an hour before bed, avoid screens, maybe try some gentle stretching or reading. Keep your bedroom cool and comfortable. If your mind is racing, try writing down your thoughts in a journal to 'park' them for tomorrow. What does your current bedtime routine look like? Sometimes small changes can make a big difference.";
  }
  
  // Work and productivity
  if (message.includes('work') || message.includes('job') || message.includes('overwhelmed') || message.includes('busy')) {
    return "Work stress can really impact our well-being, and it sounds like you might be feeling overwhelmed. 💼 Remember that it's okay to set boundaries and take breaks - you're not a machine! Try breaking large tasks into smaller, manageable steps. The Pomodoro Technique (25 minutes of focused work, 5-minute break) can be really helpful. Don't forget to step away from your workspace for lunch or a short walk. How are you taking care of yourself during your work day?";
  }
  
  // Relationships
  if (message.includes('lonely') || message.includes('alone') || message.includes('isolated')) {
    return "Feeling lonely can be really difficult, and I want you to know that you're not alone in experiencing this. 🤗 Sometimes loneliness isn't about being physically alone, but about feeling disconnected. Consider reaching out to someone you haven't talked to in a while - even a simple text can brighten both your days. Online communities, volunteering, or joining classes can also help you connect with others who share your interests. What's one small step you could take today to feel more connected?";
  }
  
  // Self-care and wellness
  if (message.includes('self-care') || message.includes('wellness') || message.includes('health')) {
    return "Self-care is such an important part of maintaining good mental health! 🌟 It doesn't have to be elaborate - sometimes it's as simple as drinking enough water, taking a few deep breaths, or spending a few minutes doing something you enjoy. What does self-care look like for you? Maybe it's a warm bath, calling a friend, reading a book, or going for a walk. The key is finding what genuinely helps you feel restored and making it a regular part of your routine.";
  }
  
  // General support and encouragement
  if (message.includes('help') || message.includes('support') || message.includes('advice')) {
    return "I'm here to support you in whatever way I can. 💙 While I can't replace professional help, I can listen and offer some gentle guidance. Remember that seeking help is a sign of strength, not weakness. If you're going through something difficult, consider reaching out to friends, family, or mental health professionals. You deserve support and care. What's something that's been on your mind lately that you'd like to talk about?";
  }
  
  // Default response
  return "Thank you for sharing with me. I'm here to listen and support you on your wellness journey. 🌱 Everyone's path to mental wellness is unique, and it's okay to take things one day at a time. Whether you're celebrating a good day or working through challenges, remember that you have strength within you. What's one thing you're grateful for today, no matter how small? Sometimes focusing on gratitude can help shift our perspective and bring a little light to our day.";
}