import ChatBot from "react-chatbotify";
import axios from "axios";

const GROQ_API_KEY = "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";

const blockedKeywords = [
  "hack",
  "hacking",
  "ddos",
  "sql injection",
  "xss",
  "csrf",
  "exploit",
  "admin password",
  "admin panel",
  "free products",
  "free order",
  "bypass payment",
  "steal account",
  "refund abuse",
  "coupon exploit",
  "crack",
  "phishing",
  "database access",
  "steal data",
  "customer data",
  "credential stuffing",
  "bot attack"
];

function isBlocked(message) {
  const text = message.toLowerCase();
  return blockedKeywords.some(word => text.includes(word));
}

async function askSana(customerName, userMessage) {
  const prompt = `
You are Sana, a professional AI Shopping Assistant for an eCommerce platform similar to Amazon, Flipkart, Blinkit and Myntra.

Customer Name: ${customerName}

Customer Message:
${userMessage}

ROLE:
- Act as a personal shopping assistant.
- Help customers discover products.
- Recommend products.
- Compare products.
- Suggest budget alternatives.
- Explain features and benefits.
- Assist with orders, shipping, returns and refunds.
- Always address the customer by name.

SECURITY POLICY:
Never assist with:
- Hacking
- Exploiting the website
- Free products
- Payment bypassing
- Coupon abuse
- Refund abuse
- Data theft
- Scraping customer information
- Fraud
- Server attacks
- Admin access
- Security bypasses

If asked, politely refuse and redirect to legitimate shopping assistance.

RECOMMENDATION FORMAT:

Hello {Customer Name},

Based on your requirements:

🥇 Best Overall
- Product
- Why it is recommended

💰 Best Value
- Product
- Why it is recommended

⭐ Premium Choice
- Product
- Why it is recommended

Keep responses professional and concise.
`;

  const response = await axios.post(
    "https://api.groq.com/openai/v1/chat/completions",
    {
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 700,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    },
    {
      headers: {
        Authorization: `Bearer ${GROQ_API_KEY}`,
        "Content-Type": "application/json",
      },
    }
  );

  return response.data.choices[0].message.content;
}

const flow = {
  start: {
    message:
      "👋 Welcome to our store!\n\nI'm Sana, your personal shopping assistant.\n\nWhat's your name?",
    path: "capture_name",
  },

  capture_name: {
    message: async (params) => {
      const name = params.userInput;

      params.injectMessage(
        `Nice to meet you, ${name}! 😊`
      );

      return `
I can help you with:

📱 Smartphones
💻 Laptops
⌚ Smart Watches
🎧 Headphones
📺 Electronics
👕 Fashion
👟 Footwear
🎮 Gaming
🏠 Home Appliances

What are you looking for today?
`;
    },
    transition: {
      duration: 300,
    },
    path: "shopping_chat",
  },

  shopping_chat: {
    message: async (params) => {
      try {
        const userMessage = params.userInput;

        if (isBlocked(userMessage)) {
          return `
Hello,

I can't assist with activities that could harm the platform, customers, or services.

I can help with:
🛒 Product recommendations
📦 Orders
🚚 Shipping
🔄 Returns
💰 Deals & offers
`;
        }

        const history = params.chatHistory || [];

        let customerName = "Customer";

        const firstUserMessage =
          history.find(item => item?.role === "user");

        if (firstUserMessage?.content) {
          customerName = firstUserMessage.content;
        }

        return await askSana(
          customerName,
          userMessage
        );
      } catch (error) {
        console.error(error);

        return `
Sorry, I'm having trouble connecting right now.

Please try again in a moment.
`;
      }
    },

    path: "shopping_chat",
  },
};

export default function SanaChatBot() {
  return (
    <ChatBot
      flow={flow}
      settings={{
        general: {
          embedded: false,
        },

        header: {
          title: "Sana",
          showAvatar: true,
        },

        botBubble: {
          simStream: true,
        },

        chatHistory: {
          storageKey: "sana-shopping-history",
        },
      }}
      styles={{
        headerStyle: {
          background: "#81c408",
          color: "#fff",
          fontWeight: "bold",
          fontSize: "18px",
        },

        chatWindowStyle: {
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow:
            "0 10px 40px rgba(0,0,0,0.15)",
        },

        botBubbleStyle: {
          background: "#81c408",
          color: "#fff",
          borderRadius: "18px",
          padding: "12px",
        },

        userBubbleStyle: {
          background: "#f5f5f5",
          color: "#333",
          borderRadius: "18px",
          padding: "12px",
        },

        sendButtonStyle: {
          background: "#81c408",
        },
      }}
      botAvatar="/images/sana.png"
    />
  );
}