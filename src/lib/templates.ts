import { Lead, AppSettings } from '../types';

export interface MessageTemplate {
  id: string;
  title: string;
  category: 'whatsapp' | 'call' | 'followup' | 'closing';
  description: string;
  generate: (lead: Lead, settings: AppSettings) => string;
}

export const OUTREACH_TEMPLATES: MessageTemplate[] = [
  {
    id: 'first_whatsapp_intro',
    title: 'First WhatsApp Introduction',
    category: 'whatsapp',
    description: 'Concise, high-trust opening message highlighting a specific opportunity without sounding pushy.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Good day ${lead.contactPerson}` : 'Good day';
      const devName = settings.developerName || 'my web studio';
      const cityMention = lead.townCity && lead.townCity !== 'Other Zimbabwe' ? ` here in ${lead.townCity}` : '';

      let observation = 'noticed your business listings online';
      if (lead.websiteStatus === 'no_website') {
        observation = `noticed that ${lead.businessName} doesn't currently have a dedicated website for customers searching on Google`;
      } else if (lead.websiteStatus === 'social_only') {
        observation = `saw your Facebook page for ${lead.businessName}. Many customers looking for ${lead.category.toLowerCase()} directly search on Google rather than social media`;
      } else if (lead.websiteStatus === 'broken_inaccessible') {
        observation = `noticed the web link listed for ${lead.businessName} seems to be offline or not loading properly`;
      } else if (lead.evidenceOfProblem) {
        observation = `noticed ${lead.evidenceOfProblem}`;
      }

      return `${recipient}, hope your week is going well.

My name is ${devName}${cityMention}. I ${observation}.

I specialize in fast, mobile-friendly websites with direct WhatsApp integration for local businesses in Zimbabwe.

I put together a quick preview of how a clean modern website for ${lead.businessName} could look. Would you be open to me sharing a 1-minute demo link here?

Best regards,
${devName}
${settings.developerPhone ? `Phone: ${settings.developerPhone}` : ''}`;
    },
  },
  {
    id: 'cold_call_script',
    title: 'Cold-Call Opening Script',
    category: 'call',
    description: 'Natural spoken dialogue guide for introducing yourself on the phone within 30 seconds.',
    generate: (lead, settings) => {
      const devName = settings.developerName || 'a local web developer';
      const cityMention = lead.townCity ? ` in ${lead.townCity}` : '';

      return `[DIAL: ${lead.phone || 'Phone number'}]

YOU: "Hello, good day! My name is ${devName}, I'm calling from${cityMention}."

[PAUSE - WAIT FOR GREETING]

YOU: "I'm calling quickly regarding ${lead.businessName}. I work with businesses in ${lead.category} building modern websites that connect directly to WhatsApp and Google Search. 

I was looking at your online listings and noticed you don't currently have a dedicated mobile website for clients looking for your services. 

Could I ask who is the best person to speak with regarding your marketing or website?"

[IF SPEAKING TO OWNER/MANAGER]:
YOU: "Glad I caught you directly. I actually created a brief sample demonstration specifically for ${lead.businessName} to show how your services and WhatsApp ordering can look on mobile. May I send you the demo link on WhatsApp to look at when you have a spare moment?"`;
    },
  },
  {
    id: 'ask_for_decision_maker',
    title: 'Asking to Speak with Owner/Manager',
    category: 'call',
    description: 'Polite, respectful script for receptionists or front-desk staff to connect with the decision maker.',
    generate: (lead, settings) => {
      const devName = settings.developerName || 'our web design studio';
      return `YOU: "Hello, good day. My name is ${devName}. 

I hope you're having a productive day. I'm reaching out specifically regarding ${lead.businessName}'s customer-facing web presence.

Could you kindly advise who manages customer acquisitions, or is the owner or managing director available for a brief 2-minute conversation? 

If they are currently tied up, what is their direct WhatsApp or email so I can forward them a customized website concept we prepared for ${lead.businessName}?"`;
    },
  },
  {
    id: 'sending_demo',
    title: 'Sending Website Demonstration',
    category: 'whatsapp',
    description: 'Delivering the interactive demo link with clear instructions and low friction.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      const demoUrl = lead.demoUrl || '[INSERT DEMO LINK HERE]';
      const devName = settings.developerName || 'my studio';

      return `${recipient}, thank you for your time earlier.

As promised, here is the working demo link I prepared for ${lead.businessName}:
👉 ${demoUrl}

A few things to notice when you open it on your phone:
1. Fast loading even on standard mobile data connections.
2. Direct 1-tap WhatsApp button so customers can chat with you immediately.
3. Clean layout highlighting your key services, photos, and physical location in ${lead.townCity}.

Take a look whenever you have 2 minutes. Let me know your thoughts or any changes you'd like to see!

Best regards,
${devName}`;
    },
  },
  {
    id: 'benefit_of_website',
    title: 'Explaining Benefit of a Website',
    category: 'whatsapp',
    description: 'Clear, practical business rationale tailored to the Zimbabwean market context (Google, trust, EcoCash/cash).',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Dear ${lead.contactPerson}` : 'Good day';
      return `${recipient},

A common question business owners ask is: "Why invest in a website when we already have WhatsApp or Facebook?"

Here are the 3 main reasons our clients in ${lead.category} see returns:

1. High-Intent Customers on Google: When someone needs ${lead.category.toLowerCase()} in ${lead.townCity}, they search on Google. Social media feeds move fast, but a website stays visible on Google 24/7.
2. Instant Credibility & Trust: In business, having your own dedicated website proves you are an established, legitimate enterprise. Clients feel safer making large orders or visiting your premises.
3. Automated Service Catalog: Instead of typing the same prices and details 20 times a day on WhatsApp, your website answers standard questions, and directs ready-to-pay clients straight to your chat.

Happy to walk you through how we make this simple and low-maintenance for ${lead.businessName}.`;
    },
  },
  {
    id: 'price_question_response',
    title: 'Responding to a Price Question',
    category: 'whatsapp',
    description: 'Transparent, confident response presenting clear value packages without haggling or vague answers.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      const starter = settings.starterPackagePrice || 150;
      const business = settings.businessPackagePrice || 280;
      const currency = settings.defaultCurrency || 'USD';

      return `${recipient}, great question! We believe in transparent, straightforward pricing.

For businesses in ${lead.category}, we offer two clear options:

Option A: Starter Business Presence — $${starter} ${currency}
• 1-page fast mobile site
• Services overview, photo gallery & opening hours
• 1-tap WhatsApp integration & Google Map location
• Domain setup & hosting included for the first year

Option B: Complete Professional Package — $${business} ${currency}
• Multi-section modern website with detailed service/product showcase
• Customer inquiry form + direct WhatsApp buttons
• Local Google Search optimization (SEO)
• Turnkey delivery in 4-6 business days

We work with a 50% deposit to begin, and the balance only after you are completely satisfied with the live site. Which package would best fit your goals for ${lead.businessName}?`;
    },
  },
  {
    id: 'google_maps_synergy',
    title: 'Explaining Website + Google Maps Synergy',
    category: 'whatsapp',
    description: 'Explaining how linking a verified website boosts local search ranking in Zimbabwe.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hello ${lead.contactPerson}` : 'Good day';
      return `${recipient},

Did you know that having a verified website significantly boosts where ${lead.businessName} appears when customers search on Google Maps?

Google prioritizes businesses with active, fast-loading websites because it considers them more reliable. By linking a dedicated website to your Google Maps pin:
• Customers can click "Website" directly from Google Maps directions.
• Your business ranks above competitors who only have an unverified pin.
• Out-of-town or international clients can review your offerings before arriving.

We can link and optimize this entire connection for you.`;
    },
  },
  {
    id: 'delivery_time_questions',
    title: 'Answering Delivery Time Questions',
    category: 'whatsapp',
    description: 'Setting clear, professional expectations on turnaround times and requirements.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      return `${recipient},

Our standard delivery time is 4 to 6 business days from the moment we receive your basic business details (your logo, key photos, and phone numbers).

Our process is simple:
• Day 1-2: We build the design and structure.
• Day 3: We send you a private review link for your feedback.
• Day 4-5: We apply any edits you request and configure your domain & WhatsApp links.
• Launch: We make it live and test everything together.

You don't need to worry about technical jargon—we handle the hosting, domain, and setup completely.`;
    },
  },
  {
    id: 'followup_after_demo',
    title: 'Following Up After Sending Demo',
    category: 'followup',
    description: 'Respectful reminder 2-3 days after sharing a demo link.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      const demoUrl = lead.demoUrl ? ` (${lead.demoUrl})` : '';

      return `${recipient}, hope you're having a good week.

Just checking in to see if you had a chance to view the website demonstration I shared for ${lead.businessName}${demoUrl}?

I'd be glad to answer any questions or make any adjustments you had in mind. Let me know what you think!`;
    },
  },
  {
    id: 'responding_to_interested',
    title: 'Responding to an Interested Prospect',
    category: 'closing',
    description: 'Actionable response when prospect expresses interest, defining next concrete steps.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      return `${recipient}, glad to hear you're interested!

To get started on the website for ${lead.businessName}, we only need three things:
1. Your company logo (or we can typeset a clean header logo for you).
2. A list of your main services and any photos of your recent work.
3. The preferred phone/WhatsApp number and physical address you want customers to contact.

Would you prefer we discuss this over a brief 5-minute phone call, or should I send our simple onboarding checklist right here on WhatsApp?`;
    },
  },
  {
    id: 'closing_the_sale',
    title: 'Closing a Sale Professionally',
    category: 'closing',
    description: 'Confident closing message confirming agreement, deposit terms, and project kickoff.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Dear ${lead.contactPerson}` : 'Good day';
      const price = lead.priceQuoted || settings.businessPackagePrice || 250;
      const deposit = Math.round(price / 2);
      const currency = settings.defaultCurrency || 'USD';

      return `${recipient}, excellent. We are excited to partner with ${lead.businessName} on this project.

Here is a summary of our agreement:
• Project: Complete Mobile-Responsive Website for ${lead.businessName}
• Total Investment: $${price} ${currency}
• Kickoff Deposit (50%): $${deposit} ${currency}
• Final Balance: $${price - deposit} ${currency} upon your approval and launch
• Turnaround: 5 business days

We can accept the deposit via Cash USD or Nostro Transfer. Once received, I will begin the development immediately and share the initial build on Day 3.

Shall I send our payment receipt details now?`;
    },
  },
  {
    id: 'polite_exit_not_interested',
    title: 'Politely Ending Conversation (Not Interested)',
    category: 'followup',
    description: 'Gracious, professional exit that leaves the door open for future business.',
    generate: (lead, settings) => {
      const recipient = lead.contactPerson ? `Hi ${lead.contactPerson}` : 'Good day';
      const devName = settings.developerName || 'my studio';
      return `${recipient}, I completely understand and appreciate you letting me know directly.

I'll keep ${lead.businessName}'s file on hold. Should you ever decide to expand your online presence or require website updates in the future, please don't hesitate to reach back out to ${devName}.

Wishing you and your business continued success!`;
    },
  },
];
