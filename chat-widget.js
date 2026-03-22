/* 
  SAINT CORE HOLDINGS - AI Chat Widget JavaScript
  File: chat-widget.js
  
  Upload this file to your Hostinger public_html folder
*/

// Create and inject chat widget HTML when page loads
document.addEventListener('DOMContentLoaded', function() {
  // Create chat widget container
  const chatWidget = document.createElement('div');
  chatWidget.id = 'saint-chat-widget';
  chatWidget.innerHTML = `
    <!-- Chat Button -->
    <div id="chat-toggle" onclick="toggleChat()">
      <span id="chat-icon">💬</span>
      <span id="close-icon">✕</span>
    </div>
    
    <!-- Chat Window -->
    <div id="chat-window">
      <div id="chat-header">
        <div id="chat-header-info">
          <div id="chat-avatar">SC</div>
          <div>
            <div id="chat-title">Saint Core Assistant</div>
            <div id="chat-status"><span class="status-dot"></span> Online</div>
          </div>
        </div>
        <button id="chat-minimize" onclick="toggleChat()">−</button>
      </div>
      
      <div id="chat-messages">
        <div class="message bot">
          <div class="message-content">
            👋 Welcome to Saint Core Holdings! I'm here to help with questions about our photography services, Airbnb stays, or handyman services. How can I assist you today?
          </div>
        </div>
      </div>
      
      <div id="chat-suggestions">
        <button class="suggestion-btn" onclick="sendSuggestion('What photography services do you offer?')">📸 Photography</button>
        <button class="suggestion-btn" onclick="sendSuggestion('Tell me about your Airbnb')">🏠 Airbnb</button>
        <button class="suggestion-btn" onclick="sendSuggestion('What handyman services are available?')">🔧 Handyman</button>
        <button class="suggestion-btn" onclick="sendSuggestion('How can I book a service?')">📅 Book Now</button>
      </div>
      
      <div id="chat-input-area">
        <input type="text" id="chat-input" placeholder="Type your message..." onkeypress="handleKeyPress(event)">
        <button id="chat-send" onclick="sendMessage()">
          <svg viewBox="0 0 24 24" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
        </button>
      </div>
    </div>
  `;
  
  // Add to page
  document.body.appendChild(chatWidget);
});

// ============================================
// CONFIGURATION - Edit your settings here
// ============================================

// API Key - Replace with your Anthropic API key for live AI
// Leave as is for demo mode with pre-programmed responses
// API key removed for security — use server-side proxy or environment variable
// IMPORTANT: Never expose API keys in client-side JavaScript
const ANTHROPIC_API_KEY = '';

// Business knowledge for AI
const BUSINESS_CONTEXT = `You are the AI assistant for Saint Core Holdings, a Chicago-based premium service provider. Be friendly, professional, and helpful. Keep responses concise (2-3 sentences unless more detail is needed).

COMPANY INFO:
- Name: Saint Core Holdings LLC
- Location: Chicago, IL (Morton Grove area)
- Phone: (872) 777-7503
- Email: hello@saintcoreholdings.com
- Website: saintcoreholdings.com

SERVICES OFFERED:

1. PHOTOGRAPHY & STUDIO RENTAL
- Professional headshots: $150-300
- Portrait sessions: $200-500
- Wedding photography: $2,500-5,500+
- Event coverage: $500-1,500
- Product photography: $200-800
- Studio rental: $100/hour, half-day $350, full-day $600
- All sessions include professional editing

2. AIRBNB / LUXURY STAYS
- Location: Morton Grove, IL (5 min walk to Metra station)
- 20 minutes to O'Hare Airport, 35 min to downtown Chicago
- Price: $90-130/night depending on season
- Amenities: High-speed WiFi (150+ Mbps), smart TV, climate control, self check-in, kitchen access, free parking, dedicated workspace
- Check-in: 3:00 PM, Check-out: 11:00 AM
- Perfect for business travelers and airport layovers
- Superhost status

3. HANDYMAN SERVICES
- Standard repairs: $65/hour
- Specialized work: $90/hour
- Services: TV mounting, furniture assembly, minor plumbing, electrical, drywall repair, painting, general maintenance
- Fully licensed and insured
- Same-day service often available

BOOKING:
- Contact via phone, email, or website contact form
- Response time: Within 1 hour during business hours
- Business hours: Mon-Fri 8AM-8PM, Sat 9AM-6PM, Sun by appointment

Always encourage visitors to contact us for custom quotes and availability.`;

// ============================================
// CHAT FUNCTIONS - No need to edit below
// ============================================

let conversationHistory = [];

function toggleChat() {
  const chatWindow = document.getElementById('chat-window');
  const chatToggle = document.getElementById('chat-toggle');
  
  chatWindow.classList.toggle('active');
  chatToggle.classList.toggle('active');
}

function handleKeyPress(event) {
  if (event.key === 'Enter') {
    sendMessage();
  }
}

function sendSuggestion(text) {
  document.getElementById('chat-input').value = text;
  sendMessage();
  
  // Hide suggestions after first use
  document.getElementById('chat-suggestions').style.display = 'none';
}

async function sendMessage() {
  const input = document.getElementById('chat-input');
  const message = input.value.trim();
  
  if (!message) return;
  
  // Add user message to chat
  addMessage(message, 'user');
  input.value = '';
  
  // Hide suggestions
  document.getElementById('chat-suggestions').style.display = 'none';
  
  // Show typing indicator
  showTypingIndicator();
  
  // Get AI response
  const response = await getAIResponse(message);
  
  // Remove typing indicator and add response
  removeTypingIndicator();
  addMessage(response, 'bot');
}

function addMessage(text, sender) {
  const messagesContainer = document.getElementById('chat-messages');
  
  const messageDiv = document.createElement('div');
  messageDiv.className = `message ${sender}`;
  
  const contentDiv = document.createElement('div');
  contentDiv.className = 'message-content';
  contentDiv.textContent = text;
  
  messageDiv.appendChild(contentDiv);
  messagesContainer.appendChild(messageDiv);
  
  // Scroll to bottom
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showTypingIndicator() {
  const messagesContainer = document.getElementById('chat-messages');
  
  const typingDiv = document.createElement('div');
  typingDiv.className = 'message bot';
  typingDiv.id = 'typing-indicator';
  
  const indicator = document.createElement('div');
  indicator.className = 'typing-indicator';
  indicator.innerHTML = '<span></span><span></span><span></span>';
  
  typingDiv.appendChild(indicator);
  messagesContainer.appendChild(typingDiv);
  messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function removeTypingIndicator() {
  const typing = document.getElementById('typing-indicator');
  if (typing) typing.remove();
}

async function getAIResponse(userMessage) {
  // Add to conversation history
  conversationHistory.push({
    role: 'user',
    content: userMessage
  });
  
  // Check if API key is set
  if (ANTHROPIC_API_KEY === 'YOUR_API_KEY_HERE') {
    // Demo mode - provide helpful responses without API
    return getDemoResponse(userMessage);
  }
  
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true'
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 300,
        system: BUSINESS_CONTEXT,
        messages: conversationHistory
      })
    });
    
    const data = await response.json();
    
    if (data.content && data.content[0]) {
      const assistantMessage = data.content[0].text;
      conversationHistory.push({
        role: 'assistant',
        content: assistantMessage
      });
      return assistantMessage;
    } else {
      return "I apologize, I'm having trouble connecting right now. Please call us at (872) 777-7503 or email hello@saintcoreholdings.com for immediate assistance.";
    }
  } catch (error) {
    console.error('Chat error:', error);
    return "I apologize, I'm having trouble connecting right now. Please call us at (872) 777-7503 or email hello@saintcoreholdings.com for immediate assistance.";
  }
}

// Demo responses when API key is not set
function getDemoResponse(message) {
  const lowerMessage = message.toLowerCase();
  
  // Photography related
  if (lowerMessage.includes('photography') || lowerMessage.includes('photo') || lowerMessage.includes('headshot') || lowerMessage.includes('portrait') || lowerMessage.includes('wedding') || lowerMessage.includes('picture')) {
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('rate')) {
      return "Our photography pricing: Headshots $150-300, Portraits $200-500, Weddings $2,500-5,500+, Events $500-1,500, Product shots $200-800. Studio rental is $100/hr. All sessions include professional editing! Call (872) 777-7503 for a custom quote.";
    }
    if (lowerMessage.includes('wedding')) {
      return "We offer full wedding photography packages from $2,500-5,500+ including engagement sessions, full day coverage, and professionally edited photos. We'd love to capture your special day! Call (872) 777-7503 to discuss your vision.";
    }
    if (lowerMessage.includes('headshot') || lowerMessage.includes('corporate') || lowerMessage.includes('professional')) {
      return "Our professional headshots range from $150-300 and include multiple looks, professional lighting, and edited digital files. Perfect for LinkedIn, websites, or company profiles. Book your session at (872) 777-7503!";
    }
    if (lowerMessage.includes('studio') || lowerMessage.includes('rent')) {
      return "Our studio rental is $100/hour, $350 for half-day (4 hrs), or $600 for full-day (8 hrs). Includes basic lighting equipment and backdrops. Great for photographers and content creators! Call (872) 777-7503 to reserve.";
    }
    return "We offer professional photography services including headshots ($150-300), portraits ($200-500), weddings ($2,500-5,500+), events, product photography, and studio rental ($100/hr). Would you like to schedule a consultation? Call us at (872) 777-7503!";
  }
  
  // Airbnb related
  if (lowerMessage.includes('airbnb') || lowerMessage.includes('stay') || lowerMessage.includes('rental') || lowerMessage.includes('hotel') || lowerMessage.includes('room') || lowerMessage.includes('accommodation') || lowerMessage.includes('book') && lowerMessage.includes('night')) {
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('rate') || lowerMessage.includes('per night')) {
      return "Our luxury townhouse is $90-130/night depending on the season. This includes all amenities: high-speed WiFi, smart TV, kitchen access, free parking, and self check-in. Perfect for O'Hare travelers! Check availability at (872) 777-7503.";
    }
    if (lowerMessage.includes('amenity') || lowerMessage.includes('amenities') || lowerMessage.includes('include') || lowerMessage.includes('feature')) {
      return "Our Airbnb includes: High-speed WiFi (150+ Mbps), smart TV with streaming, climate control, self check-in, full kitchen access, free parking, dedicated workspace, and premium bedding. Everything you need for a comfortable stay!";
    }
    if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('airport') || lowerMessage.includes('ohare') || lowerMessage.includes('o\'hare')) {
      return "We're in Morton Grove, IL - just 5 min walk to Metra station, 20 minutes to O'Hare Airport, and 35 min to downtown Chicago. Perfect for business travelers and airport layovers! Book at (872) 777-7503.";
    }
    if (lowerMessage.includes('check') && (lowerMessage.includes('in') || lowerMessage.includes('out'))) {
      return "Check-in is at 3:00 PM and check-out is at 11:00 AM. We offer self check-in with a secure lockbox, so you can arrive at your convenience. Early check-in or late check-out may be available - just ask!";
    }
    return "Our luxury townhouse in Morton Grove is perfect for travelers! Just 20 min from O'Hare, 5 min walk to Metra. Rates are $90-130/night with amenities like high-speed WiFi, smart TV, kitchen, and free parking. Check-in at 3 PM. Want me to help you book? Call (872) 777-7503!";
  }
  
  // Handyman related
  if (lowerMessage.includes('handyman') || lowerMessage.includes('repair') || lowerMessage.includes('fix') || lowerMessage.includes('install') || lowerMessage.includes('mount') || lowerMessage.includes('tv') || lowerMessage.includes('furniture') || lowerMessage.includes('plumbing') || lowerMessage.includes('electrical') || lowerMessage.includes('paint')) {
    if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('how much') || lowerMessage.includes('rate')) {
      return "Our handyman rates: Standard repairs $65/hour, specialized work $90/hour. Many common tasks have flat-rate pricing. We're fully licensed and insured. Call (872) 777-7503 for a free estimate!";
    }
    if (lowerMessage.includes('tv') || lowerMessage.includes('mount')) {
      return "Yes! TV mounting is one of our most popular services. We'll mount your TV securely, hide the cables, and make sure everything is level and perfect. Pricing depends on TV size and wall type. Call (872) 777-7503 for a quote!";
    }
    if (lowerMessage.includes('what') && lowerMessage.includes('service')) {
      return "We handle: TV mounting, furniture assembly, minor plumbing, electrical work, drywall repair, painting, general maintenance, and more! Fully licensed and insured with same-day service often available. Call (872) 777-7503!";
    }
    return "Our handyman services start at $65/hour for standard repairs and $90/hour for specialized work. We handle TV mounting, furniture assembly, plumbing, electrical, drywall, painting, and more. Fully licensed and insured! Call (872) 777-7503 for a free estimate.";
  }
  
  // Pricing general
  if (lowerMessage.includes('price') || lowerMessage.includes('cost') || lowerMessage.includes('rate') || lowerMessage.includes('how much') || lowerMessage.includes('pricing')) {
    return "Our rates vary by service:\n\n📸 Photography: $150-5,500 (depending on type)\n🏠 Airbnb: $90-130/night\n🔧 Handyman: $65-90/hour\n\nWhich service would you like more details about?";
  }
  
  // Booking
  if (lowerMessage.includes('book') || lowerMessage.includes('schedule') || lowerMessage.includes('appointment') || lowerMessage.includes('reserve') || lowerMessage.includes('available')) {
    return "I'd be happy to help you book! You can:\n\n📞 Call: (872) 777-7503\n✉️ Email: hello@saintcoreholdings.com\n🌐 Website: saintcoreholdings.com/contact\n\nWe typically respond within 1 hour during business hours!";
  }
  
  // Location
  if (lowerMessage.includes('location') || lowerMessage.includes('where') || lowerMessage.includes('address') || lowerMessage.includes('area') || lowerMessage.includes('chicago')) {
    return "We're based in Morton Grove, IL (Chicago area). Our Airbnb is 5 min walk from Morton Grove Metra station, 20 min from O'Hare Airport, and 35 min from downtown Chicago. We serve the greater Chicago area for all services!";
  }
  
  // Contact
  if (lowerMessage.includes('contact') || lowerMessage.includes('phone') || lowerMessage.includes('email') || lowerMessage.includes('reach') || lowerMessage.includes('call') || lowerMessage.includes('number')) {
    return "You can reach us at:\n\n📞 (872) 777-7503\n✉️ hello@saintcoreholdings.com\n🌐 saintcoreholdings.com/contact\n\nBusiness hours: Mon-Fri 8AM-8PM, Sat 9AM-6PM. We respond within 1 hour!";
  }
  
  // Hours
  if (lowerMessage.includes('hour') || lowerMessage.includes('open') || lowerMessage.includes('close') || lowerMessage.includes('when')) {
    return "Our business hours are:\n\n📅 Monday-Friday: 8:00 AM - 8:00 PM\n📅 Saturday: 9:00 AM - 6:00 PM\n📅 Sunday: By appointment\n\nWe respond to messages within 1 hour during business hours!";
  }
  
  // Greetings
  if (lowerMessage.includes('hello') || lowerMessage.includes('hi') || lowerMessage.includes('hey') || lowerMessage.includes('good morning') || lowerMessage.includes('good afternoon') || lowerMessage.includes('good evening')) {
    return "Hello! 👋 Welcome to Saint Core Holdings. We offer premium photography services, luxury Airbnb stays near O'Hare, and professional handyman services in Chicago. How can I help you today?";
  }
  
  // Thanks
  if (lowerMessage.includes('thank') || lowerMessage.includes('thanks') || lowerMessage.includes('appreciate')) {
    return "You're welcome! 😊 Is there anything else I can help you with? Feel free to call us at (872) 777-7503 if you'd like to speak with someone directly.";
  }
  
  // Default response
  return "Thanks for your message! We offer three main services:\n\n📸 Photography (headshots, portraits, weddings)\n🏠 Airbnb stays near O'Hare\n🔧 Handyman services\n\nWhat would you like to know more about? Or call us at (872) 777-7503 for immediate assistance!";
}
