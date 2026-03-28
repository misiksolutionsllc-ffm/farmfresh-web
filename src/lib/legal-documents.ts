// MISIKSOLUTIONS LLC — FarmFresh Hub Legal Documents
// Contact: misiksolutionsllc@gmail.com
// Wellington, Florida

export interface LegalDocument {
  id: string;
  title: string;
  lastUpdated: string;
  icon: string;
  sections: { heading: string; content: string }[];
}

export const LEGAL_DOCUMENTS: LegalDocument[] = [
  {
    id: 'terms',
    title: 'Terms of Service',
    lastUpdated: 'March 28, 2026',
    icon: '📜',
    sections: [
      {
        heading: '1. Agreement to Terms',
        content: `Welcome to FarmFresh Hub, operated by MISIKSOLUTIONS LLC ("Company," "we," "us," or "our"), a Florida limited liability company with its principal place of business in Wellington, Florida. By accessing or using the FarmFresh Hub platform, mobile application, or website (collectively, the "Platform"), you agree to be bound by these Terms of Service ("Terms"). If you do not agree, do not use the Platform.\n\nFarmFresh Hub is a technology marketplace that connects consumers with local farmers and independent delivery drivers. WE ARE NOT A FOOD SELLER, PRODUCER, DISTRIBUTOR, OR DELIVERY COMPANY. We provide a technology platform that facilitates transactions between independent third parties.\n\nPLEASE READ THESE TERMS CAREFULLY. THEY CONTAIN AN ARBITRATION AGREEMENT AND CLASS ACTION WAIVER THAT AFFECT YOUR LEGAL RIGHTS.`,
      },
      {
        heading: '2. Eligibility & Accounts',
        content: `To use the Platform, you must: (a) be at least 18 years of age; (b) be a legal resident of the United States; (c) have a valid email address; (d) not have been previously suspended or removed from the Platform.\n\nYou are responsible for maintaining the confidentiality of your account credentials. You agree not to share, transfer, or sell your account. You are liable for all activity that occurs under your account. You must notify us immediately at misiksolutionsllc@gmail.com of any unauthorized use.\n\nWe reserve the right to suspend or terminate accounts that violate these Terms, contain false information, or engage in fraudulent activity.`,
      },
      {
        heading: '3. Platform Services',
        content: `FarmFresh Hub provides:\n• A marketplace for consumers to browse and purchase natural food products from local farmers ("Farmer American Heroes")\n• A delivery coordination system connecting orders with independent delivery drivers\n• AI-powered product recognition and description tools (powered by Anthropic Claude)\n• Payment processing and order management\n\nAll products listed on the Platform are sold directly by independent Farmer American Hero merchants. Title to products passes directly from the farmer to the consumer at the point of pickup. FarmFresh Hub never takes title to, possession of, or liability for any food products.\n\nProduct descriptions, photos, nutritional information, allergen declarations, and pricing are provided by the merchants and are their sole responsibility.`,
      },
      {
        heading: '4. Orders, Pricing & Payments',
        content: `All prices displayed on the Platform are set by the individual farmers/merchants. The following fees apply to each order and are displayed before checkout confirmation:\n• Product Price — set by merchant\n• Delivery Fee — base fee for delivery coordination\n• Platform Service Fee — percentage-based fee for marketplace services\n• Applicable Taxes — calculated based on delivery address jurisdiction\n• Driver Tip — 100% of tips go directly to the delivery driver\n\nYou authorize us to charge your selected payment method for the total order amount. Prices may vary due to seasonal availability, product weight adjustments, or promotional offers. Final charges may differ from estimates for weight-based products.\n\nFarmFresh Hub acts as a marketplace facilitator for sales tax purposes in applicable jurisdictions.`,
      },
      {
        heading: '5. Farmer American Hero Merchants',
        content: `Farmers and merchants using the Platform operate as independent businesses. They are solely responsible for:\n• Compliance with all federal, state, and local food safety regulations\n• Accuracy of product listings, descriptions, ingredients, and allergen information\n• Proper food handling, storage, preparation, and packaging\n• Maintaining required licenses, permits, and insurance\n• Florida cottage food labeling requirements where applicable (per FL §500.80)\n• Collecting and remitting any taxes not covered by marketplace facilitator rules\n\nFarmFresh Hub does not guarantee the quality, safety, legality, or accuracy of any products listed by merchants. Merchants agree to comply with our Natural Food Standards and Community Guidelines.`,
      },
      {
        heading: '6. Delivery Drivers',
        content: `Delivery drivers on the Platform are independent contractors, not employees of MISIKSOLUTIONS LLC. Drivers:\n• Control the means and methods of delivery\n• May accept or reject any delivery request\n• Set their own schedules and work for competing platforms\n• Provide their own vehicle, equipment, and insulated food transport bags\n• Are responsible for compliance with all traffic and food handling laws\n\n100% of customer tips are passed through to drivers. FarmFresh Hub does not control the route, timing, or methods drivers use to complete deliveries.`,
      },
      {
        heading: '7. User Content & Reviews',
        content: `You may submit reviews, ratings, photos, and other content ("User Content"). By submitting User Content, you grant MISIKSOLUTIONS LLC a non-exclusive, worldwide, royalty-free license to use, display, and distribute such content on the Platform.\n\nYou agree that your reviews will be honest and based on actual experience. In compliance with the FTC Consumer Review Fairness Act, we do not restrict, penalize, or suppress honest consumer feedback.\n\nWe reserve the right to remove content that is fraudulent, defamatory, obscene, threatening, or violates any law or our Community Guidelines.`,
      },
      {
        heading: '8. Intellectual Property',
        content: `The FarmFresh Hub name, logo, design, software, and all proprietary content are owned by MISIKSOLUTIONS LLC and protected by U.S. copyright, trademark, and intellectual property laws. You may not copy, modify, distribute, or create derivative works from our intellectual property without prior written consent.\n\nProduct photos processed by our AI system remain the property of the uploading user. AI-generated product descriptions are licensed to the Platform for marketplace display purposes.`,
      },
      {
        heading: '9. Disclaimers & Limitation of Liability',
        content: `THE PLATFORM IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, OR NON-INFRINGEMENT.\n\nFARMFRESH HUB DOES NOT WARRANT THE QUALITY, SAFETY, OR LEGALITY OF ANY FOOD PRODUCTS. WE DO NOT GUARANTEE DELIVERY TIMES, PRODUCT AVAILABILITY, OR UNINTERRUPTED SERVICE.\n\nFOOD ALLERGEN DISCLAIMER: Allergen information is provided by merchants. Cross-contamination may occur. If you have severe food allergies, contact the merchant directly before ordering.\n\nTO THE MAXIMUM EXTENT PERMITTED BY LAW, MISIKSOLUTIONS LLC'S TOTAL LIABILITY SHALL NOT EXCEED THE LESSER OF: (A) THE AMOUNTS PAID BY YOU TO US IN THE 12 MONTHS PRECEDING THE CLAIM, OR (B) $500.00.\n\nWE ARE NOT LIABLE FOR INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES ARISING FROM YOUR USE OF THE PLATFORM OR CONSUMPTION OF ANY PRODUCTS.`,
      },
      {
        heading: '10. Dispute Resolution & Arbitration',
        content: `ARBITRATION AGREEMENT: You and MISIKSOLUTIONS LLC agree that any disputes arising from these Terms or your use of the Platform shall be resolved through binding individual arbitration administered by the American Arbitration Association (AAA) under its Consumer Arbitration Rules.\n\nCLASS ACTION WAIVER: You agree to resolve disputes on an individual basis only. You waive the right to participate in any class action, collective action, or representative proceeding.\n\n30-DAY OPT-OUT: You may opt out of this arbitration agreement by sending written notice to misiksolutionsllc@gmail.com within 30 days of creating your account. The notice must include your name, email, and a clear statement opting out.\n\nEXCEPTIONS: Either party may bring claims in small claims court. This arbitration provision does not apply to delivery drivers who qualify for the transportation worker exemption under the Federal Arbitration Act.\n\nPRE-ARBITRATION RESOLUTION: Before initiating arbitration, you must send a written description of your dispute to misiksolutionsllc@gmail.com and allow 60 days for informal resolution.`,
      },
      {
        heading: '11. Governing Law',
        content: `These Terms are governed by and construed in accordance with the laws of the State of Florida, without regard to conflict of law principles. To the extent litigation is permitted, you consent to the exclusive jurisdiction of the state and federal courts located in Palm Beach County, Florida.\n\nIf any provision of these Terms is found unenforceable, the remaining provisions shall continue in full force and effect.`,
      },
      {
        heading: '12. Modifications & Termination',
        content: `We may modify these Terms at any time by posting updated Terms on the Platform. Material changes will be communicated via email or in-app notification at least 30 days before they take effect. Your continued use of the Platform after changes constitutes acceptance.\n\nWe may suspend or terminate your account at any time for violation of these Terms. You may delete your account at any time by contacting misiksolutionsllc@gmail.com.\n\nUpon termination, provisions that by their nature should survive (including indemnification, limitation of liability, arbitration, and intellectual property) shall remain in effect.\n\nContact: MISIKSOLUTIONS LLC\nEmail: misiksolutionsllc@gmail.com\nLocation: Wellington, Florida, United States`,
      },
    ],
  },

  {
    id: 'privacy',
    title: 'Privacy Policy',
    lastUpdated: 'March 28, 2026',
    icon: '🔒',
    sections: [
      {
        heading: '1. Introduction',
        content: `MISIKSOLUTIONS LLC ("FarmFresh Hub," "we," "us") respects your privacy. This Privacy Policy describes how we collect, use, disclose, and protect personal information when you use the FarmFresh Hub platform.\n\nThis policy applies to all users: consumers, Farmer American Hero merchants, and delivery drivers. It complies with applicable U.S. federal and state privacy laws, including the California Consumer Privacy Act (CCPA/CPRA), Florida Digital Bill of Rights (FDBR), Texas Data Privacy and Security Act (TDPSA), and other state privacy statutes.\n\nContact: misiksolutionsllc@gmail.com`,
      },
      {
        heading: '2. Information We Collect',
        content: `INFORMATION YOU PROVIDE DIRECTLY:\n• Account data: name, email address, phone number, password\n• Profile data: delivery addresses, payment methods, dietary preferences\n• Merchant data: farm name, business address, tax identification, banking details, business licenses, food safety certifications\n• Driver data: driver's license, vehicle information, insurance, banking details\n• Order data: order history, delivery instructions, special requests\n• Product data: product photos uploaded for AI analysis, product descriptions\n• Communications: messages, support requests, reviews, ratings\n\nINFORMATION COLLECTED AUTOMATICALLY:\n• Device data: device type, operating system, browser type, unique device identifiers\n• Usage data: pages viewed, features used, session duration, click patterns\n• Location data: GPS coordinates (with your consent), IP-based approximate location\n• Cookies and tracking technologies: see our Cookie Policy for details\n\nINFORMATION FROM THIRD PARTIES:\n• Payment processors (Stripe): transaction verification, fraud prevention\n• Identity verification services: for merchant and driver onboarding\n• Public databases: business license verification`,
      },
      {
        heading: '3. How We Use Your Information',
        content: `We use personal information for the following business purposes:\n• Providing and improving the Platform (account management, order processing, delivery coordination)\n• Payment processing and financial record-keeping\n• AI-powered product recognition using Anthropic Claude API (product photos are sent to Anthropic's API for analysis; Anthropic does not use API data to train their models per their commercial terms)\n• Customer support and dispute resolution\n• Safety and fraud prevention\n• Legal compliance (tax reporting, regulatory requirements, law enforcement requests)\n• Communications (order updates, platform announcements, marketing with your consent)\n• Analytics and Platform improvement\n• Personalized product recommendations based on order history and preferences`,
      },
      {
        heading: '4. GPS Location Data',
        content: `PRECISE LOCATION DATA IS CLASSIFIED AS SENSITIVE PERSONAL INFORMATION under CCPA and most state privacy laws.\n\nWe collect precise GPS location data ONLY with your affirmative opt-in consent, for the following purposes:\n• Consumers: determining delivery address accuracy, showing nearby farms\n• Drivers: real-time delivery tracking, route optimization, delivery verification\n• Merchants: verifying farm/business address during onboarding\n\nYou may disable location access at any time through your device settings. Disabling location may limit certain features (e.g., GPS address detection during checkout).\n\nWe do not sell or share precise location data with third parties for advertising purposes. Location data is retained for 90 days after the associated delivery is completed, then aggregated and de-identified.`,
      },
      {
        heading: '5. AI Processing Disclosure',
        content: `FarmFresh Hub uses Anthropic Claude AI technology for:\n• Product photo recognition and categorization\n• Automated product description generation\n• Strategic business analytics in Mission Control\n\nWhen you upload a product photo, the image is sent to Anthropic's API for processing. Anthropic's commercial API terms state that customer data is not used to train their AI models. AI-generated product descriptions are clearly labeled as "AI Generated" in the Platform.\n\nAI processing does not affect your eligibility for services, pricing, or account standing. You may edit or replace any AI-generated content.`,
      },
      {
        heading: '6. How We Share Information',
        content: `We share personal information with:\n• MERCHANTS: Your name, delivery address, phone number, and order details are shared with the merchant fulfilling your order\n• DELIVERY DRIVERS: Your name, delivery address, phone number, and delivery instructions are shared with assigned drivers\n• PAYMENT PROCESSORS: Payment information is processed by Stripe; we do not store full card numbers\n• SERVICE PROVIDERS: Cloud hosting (Vercel), analytics, customer support tools — all under data processing agreements\n• LEGAL REQUIREMENTS: We may disclose information when required by law, court order, or government request\n• BUSINESS TRANSFERS: In the event of a merger, acquisition, or sale of assets\n\nWE DO NOT SELL YOUR PERSONAL INFORMATION. We do not share your data with data brokers or for cross-context behavioral advertising.`,
      },
      {
        heading: '7. Your Privacy Rights',
        content: `Depending on your state of residence, you may have the following rights:\n\nCALIFORNIA RESIDENTS (CCPA/CPRA):\n• Right to know what personal information is collected, used, and shared\n• Right to delete your personal information\n• Right to correct inaccurate information\n• Right to opt-out of the sale/sharing of personal information\n• Right to limit use of sensitive personal information\n• Right to non-discrimination for exercising privacy rights\n\nFLORIDA RESIDENTS (FDBR):\n• Right to access, delete, and correct personal data\n• Right to opt-out of sale of sensitive data including geolocation\n\nTEXAS, COLORADO, CONNECTICUT, VIRGINIA, AND OTHER STATE RESIDENTS:\n• Rights to access, delete, correct, and data portability\n• Right to opt-out of targeted advertising and profiling\n\nTo exercise your rights, email misiksolutionsllc@gmail.com with "Privacy Rights Request" in the subject line. We will verify your identity and respond within 45 days (extendable by 45 days with notice).\n\nDO NOT SELL OR SHARE MY PERSONAL INFORMATION: Visit our Privacy Settings page or email us to opt-out. We honor Global Privacy Control (GPC) browser signals.`,
      },
      {
        heading: '8. Data Retention & Security',
        content: `We retain personal information only as long as necessary for the purposes described in this policy:\n• Active account data: retained while account is active, deleted within 90 days of account deletion request\n• Order history: retained for 3 years for tax and legal compliance\n• Payment records: retained for 7 years per IRS requirements\n• Location data: 90 days after associated delivery\n• AI-processed photos: 30 days after product listing creation\n• Support communications: 2 years\n\nWe implement industry-standard security measures including:\n• 256-bit TLS encryption for data in transit\n• AES-256 encryption for data at rest\n• PCI DSS compliant payment processing via Stripe\n• Regular security audits and vulnerability testing\n• Access controls with role-based permissions\n• Incident response procedures with 72-hour breach notification`,
      },
      {
        heading: '9. Children\'s Privacy',
        content: `FarmFresh Hub is not directed to children under the age of 13. We do not knowingly collect personal information from children under 13. If we discover that a child under 13 has provided us with personal information, we will promptly delete it and notify the parent/guardian.\n\nFor users between 13 and 18, we encourage parental involvement in online activities. The Florida FDBR includes additional protections for minors under 18.`,
      },
      {
        heading: '10. Contact & Updates',
        content: `For privacy inquiries, data requests, or complaints:\n\nMISIKSOLUTIONS LLC\nEmail: misiksolutionsllc@gmail.com\nLocation: Wellington, Florida, United States\n\nCalifornia residents may also contact the California Attorney General at oag.ca.gov.\n\nWe may update this Privacy Policy periodically. Material changes will be communicated via email or in-app notification at least 30 days before taking effect. The "Last Updated" date at the top of this policy indicates the most recent revision.`,
      },
    ],
  },

  {
    id: 'refund',
    title: 'Refund Policy',
    lastUpdated: 'March 28, 2026',
    icon: '💸',
    sections: [
      {
        heading: '1. Overview',
        content: `FarmFresh Hub is committed to ensuring your satisfaction with every order. As a marketplace connecting consumers with independent farmers and delivery drivers, refund responsibility is shared based on the nature of the issue.\n\nThis policy complies with Florida Statute §501.615 (remote sales refunds within 30 days), Florida Statute §501.95 (no expiration on platform credits), and California AB 578 (full refund to original payment method for undelivered/incorrect food delivery orders, effective January 2026).`,
      },
      {
        heading: '2. Refund Eligibility & Timeframes',
        content: `You may request a refund within the following windows:\n• Missing or incorrect items: within 48 hours of delivery\n• Food quality or freshness issues: within 24 hours of delivery\n• Food safety concerns: within 48 hours of delivery\n• Non-delivery (order never arrived): within 24 hours of scheduled delivery\n• Damaged items: within 24 hours with photo evidence\n\nTo request a refund, use the "Report Issue" button in your order details or email misiksolutionsllc@gmail.com with your order number and description of the issue. Photo evidence is required for quality, damage, and missing item claims.`,
      },
      {
        heading: '3. Order Cancellation',
        content: `BEFORE MERCHANT BEGINS PREPARATION:\n• Full refund to original payment method\n• Cancellation is instant and automatic\n\nAFTER MERCHANT BEGINS PREPARATION:\n• 90% refund (10% covers merchant preparation costs)\n• Platform fee is fully refunded\n\nAFTER DRIVER PICKUP:\n• No refund for cancellation by consumer\n• Exception: if estimated delivery time exceeds 60 minutes past original estimate\n\nMERCHANT CANCELLATION:\n• Full refund to original payment method\n• Platform credit of $5 for inconvenience`,
      },
      {
        heading: '4. Responsibility Allocation',
        content: `MERCHANT IS RESPONSIBLE FOR:\n• Missing items from the order\n• Incorrect items (wrong product sent)\n• Food quality at the point of pickup (freshness, appearance, taste)\n• Inaccurate product descriptions or allergen information\n• Underweight products (for weight-based pricing)\n\nPLATFORM IS RESPONSIBLE FOR:\n• Non-delivery due to system errors\n• Overcharges due to pricing glitches\n• Food damaged during delivery transit\n• Temperature/spoilage issues during transit\n• Delivery to wrong address due to platform GPS error\n\nDRIVER ACCOUNTABILITY:\n• Non-delivery (falsely marked as delivered)\n• Food tampering during transit\n• Excessive delivery delays due to driver negligence\n\nCONSUMER BEARS COST FOR:\n• Incorrect delivery address provided by consumer\n• Failure to be available for delivery at specified time\n• Fraudulent claims (subject to account suspension)`,
      },
      {
        heading: '5. Refund Methods',
        content: `Refunds are issued in one of two forms, AT YOUR CHOICE:\n\n1. ORIGINAL PAYMENT METHOD: Refunded to the credit/debit card or payment method used. Processing time: 5-10 business days depending on your bank.\n\n2. PLATFORM CREDIT: Instant credit applied to your FarmFresh Hub account. Credits never expire per Florida Statute §501.95. Credits apply automatically to your next order.\n\nWe will NEVER force platform credits as the sole refund option. You always have the right to receive a refund to your original payment method.\n\nTips are refunded in full for non-delivery situations. For partial order issues, tips are not adjusted unless the entire order is refunded.`,
      },
      {
        heading: '6. Natural Food Product Variability',
        content: `Farm-to-table products are natural and may vary in size, shape, color, and appearance. Minor cosmetic variations are inherent to natural farming and are NOT grounds for a refund.\n\nRefunds ARE warranted when:\n• Product is significantly different from the listing description\n• Product shows signs of spoilage, mold, or contamination\n• Product fails to meet the FarmFresh Hub Natural Food Standards\n• Seasonal product is substituted without consumer approval\n\nWeight-based products: If the actual weight differs by more than 10% from the listed weight, you will receive a proportional price adjustment automatically.`,
      },
      {
        heading: '7. Dispute Resolution',
        content: `If you are not satisfied with a refund decision:\n\nSTEP 1: Contact our support team at misiksolutionsllc@gmail.com with your order number and concern.\nSTEP 2: A senior support agent will review within 48 hours.\nSTEP 3: If unresolved, request escalation to management review (5 business days).\nSTEP 4: If still unresolved, you may initiate arbitration per our Terms of Service.\n\nWe maintain a fair-use policy. Accounts with an unusually high rate of refund claims may be subject to review. Confirmed fraudulent claims result in permanent account suspension.`,
      },
    ],
  },

  {
    id: 'community',
    title: 'Community Guidelines',
    lastUpdated: 'March 28, 2026',
    icon: '🤝',
    sections: [
      {
        heading: '1. Our Community Principles',
        content: `FarmFresh Hub is built on four principles that apply equally to every participant — consumers, Farmer American Heroes, and delivery drivers:\n\nRESPECT: Treat everyone with dignity and courtesy.\nSAFETY: Prioritize food safety and personal safety at all times.\nAUTHENTICITY: Be honest and transparent in all interactions.\nINTEGRITY: Follow the law and honor your commitments.\n\nThese guidelines exist to create a trustworthy marketplace where communities can access clean, natural food from local farmers. Violations undermine that trust and will be addressed proportionately.`,
      },
      {
        heading: '2. Standards for Everyone',
        content: `ALL platform participants must:\n• Comply with all applicable local, state, and federal laws\n• Treat all people with respect regardless of race, ethnicity, national origin, religion, gender, gender identity, sexual orientation, disability, age, or veteran status\n• Maintain accurate account information\n• Use only their own account (no sharing, selling, or transferring accounts)\n• Communicate respectfully through the Platform\n• Report safety concerns promptly\n• Cooperate with Platform investigations\n\nALL participants must NOT:\n• Engage in harassment, threats, or intimidation\n• Discriminate against any person\n• Create fraudulent accounts or engage in identity theft\n• Manipulate ratings, reviews, or Platform systems\n• Use the Platform for illegal activities\n• Share other users' personal information`,
      },
      {
        heading: '3. Consumer Standards',
        content: `As a consumer, you agree to:\n• Provide accurate delivery information and be available to receive orders\n• Submit honest reviews based on actual experience (per FTC Consumer Review Fairness Act)\n• Report food safety or quality issues promptly and truthfully\n• Not submit fraudulent claims for missing, damaged, or incorrect items\n• Treat delivery drivers respectfully during handoff\n• Provide safe, accessible delivery locations\n• Follow age verification requirements for applicable products\n\nAccount actions for violations:\n• Fraudulent refund claims: warning, then suspension after 3 confirmed incidents\n• Review manipulation: review removal and account warning\n• Harassment of drivers/merchants: immediate suspension pending review\n• Repeated no-shows for deliveries: delivery restrictions`,
      },
      {
        heading: '4. Farmer American Hero Standards',
        content: `As a Farmer American Hero merchant, you agree to:\n• List only products that comply with our Natural Food Standards\n• Provide accurate product descriptions, photos, ingredients, weights, and allergen information\n• Maintain all required licenses, permits, and food safety certifications\n• Practice proper food handling, storage, and packaging\n• Respond to orders promptly and communicate delays\n• Honor listed prices and availability\n• Cooperate with quality audits and inspections\n• Label cottage food products per Florida §500.80 requirements\n• Not misrepresent certifications (organic, non-GMO, etc.)\n\nAccount actions for violations:\n• Inaccurate listings: correction required within 24 hours, listing removed after 3 violations\n• Food safety complaint: investigation, temporary suspension during review\n• Certification misrepresentation: immediate suspension, permanent ban for willful fraud\n• Natural Food Standards violation: product removal, remediation plan required`,
      },
      {
        heading: '5. Delivery Driver Standards',
        content: `As a delivery driver, you agree to:\n• Maintain food safety during transport using insulated bags\n• Complete deliveries in a timely manner\n• Handle all food products with care\n• Follow all traffic laws and drive safely — never under impairment\n• Provide accurate delivery status updates\n• Take delivery verification photos\n• Maintain a clean, well-maintained vehicle suitable for food transport\n• Treat consumers and merchants with professionalism\n• Use only your own verified account\n\nAccount actions for violations:\n• Food tampering: immediate permanent deactivation\n• Impaired driving: immediate permanent deactivation\n• Delivery fraud (marking delivered without delivery): warning, then deactivation\n• Customer harassment: immediate suspension pending review\n• Vehicle safety violations: temporary deactivation until resolved`,
      },
      {
        heading: '6. Enforcement & Appeals',
        content: `We enforce these guidelines through a graduated system:\n\nLEVEL 1 — WARNING: Written notification describing the violation and expected correction.\nLEVEL 2 — TEMPORARY SUSPENSION: Account restricted for 7-30 days with required acknowledgment before reinstatement.\nLEVEL 3 — PERMANENT DEACTIVATION: Account permanently removed. Reserved for severe or repeated violations.\n\nSevere violations (threats of violence, food tampering, fraud, discrimination) may result in immediate Level 3 action.\n\nAPPEALS: All users have the right to appeal enforcement decisions by emailing misiksolutionsllc@gmail.com within 14 days of the action. Appeals are reviewed by a different team member than the original decision-maker. You will receive a written response within 10 business days.\n\nWe are committed to fair, transparent, and proportionate enforcement. We publish anonymized enforcement statistics quarterly.`,
      },
    ],
  },

  {
    id: 'natural',
    title: 'Natural Food Standards',
    lastUpdated: 'March 28, 2026',
    icon: '🌿',
    sections: [
      {
        heading: '1. Our Natural Food Pledge',
        content: `FarmFresh Hub exists to connect communities with clean, natural, locally-sourced food. Our Natural Food Standards define what products may be sold on our Platform.\n\nThese standards go beyond the FDA's informal definition of "natural" (nothing artificial or synthetic has been added that would not normally be expected in the food). We maintain stricter requirements because our customers trust us to deliver truly clean food.\n\nAll Farmer American Hero merchants must comply with these standards. Compliance is verified through onboarding certification, ongoing monitoring, and periodic audit rights.`,
      },
      {
        heading: '2. Prohibited Substances',
        content: `The following are PROHIBITED in all products sold on FarmFresh Hub:\n\nGENETICALLY MODIFIED ORGANISMS (GMOs):\n• No genetically engineered ingredients or bioengineered food products\n• Seeds, crops, and ingredients must be from non-GMO sources\n• Products at risk of GMO contamination (corn, soy, canola, sugar beets) require Non-GMO Project Verification or equivalent documentation\n\nSYNTHETIC PESTICIDES & HERBICIDES:\n• No synthetic chemical pesticides, herbicides, fungicides, or fumigants\n• Integrated Pest Management (IPM) using natural methods is encouraged\n• Transitional farmers (converting from conventional to organic) must disclose their status\n\nARTIFICIAL ADDITIVES:\n• No artificial preservatives (BHA, BHT, TBHQ, sodium benzoate)\n• No artificial colors (FD&C dyes, Red 40, Yellow 5, Blue 1, etc.)\n• No artificial flavors or flavor enhancers (MSG, autolyzed yeast extract)\n• No artificial sweeteners (aspartame, sucralose, acesulfame-K, saccharin)\n• No high-fructose corn syrup\n• No hydrogenated or partially hydrogenated oils\n\nHORMONES & ANTIBIOTICS:\n• No growth hormones administered to animals\n• No routine/preventive antibiotic use (therapeutic use under veterinary supervision is permitted with proper withdrawal periods)\n• No ractopamine or beta-agonist growth promoters`,
      },
      {
        heading: '3. Accepted Certifications',
        content: `FarmFresh Hub recognizes the following third-party certifications. Products with these certifications receive premium "Verified" badges on the Platform:\n\nTIER 1 — GOLD STANDARD:\n• USDA Organic — meets the National Organic Program standards\n• Non-GMO Project Verified — third-party verification of non-GMO status\n• Certified Naturally Grown — peer-review certification for small farms\n\nTIER 2 — RECOGNIZED:\n• USDA Good Agricultural Practices (GAP) Certification\n• Global Animal Partnership (animal welfare rating)\n• American Grassfed Association Certified\n• Fair Trade USA Certified\n• Demeter Biodynamic Certification\n• Florida "Fresh From Florida" state program\n\nTIER 3 — SELF-ATTESTED:\n• Farmers without formal certifications may sell on the Platform with a signed Natural Food Pledge and self-attestation of compliance\n• Self-attested products are labeled "Farmer Pledged" rather than "Verified"\n• FarmFresh Hub reserves the right to request documentation or conduct audits at any time`,
      },
      {
        heading: '4. Product Categories & Specific Requirements',
        content: `FRESH PRODUCE:\n• Must be grown without synthetic pesticides or GMO seeds\n• Harvest date must be disclosed; produce must be sold within quality window\n• Proper post-harvest handling and cold chain maintenance required\n\nDAIRY & EGGS:\n• Animals must be raised without growth hormones or routine antibiotics\n• Eggs must be from cage-free or pasture-raised hens (minimum)\n• Raw/unpasteurized dairy must comply with Florida state regulations\n\nMEAT & POULTRY:\n• USDA/FSIS inspection required for all meat sold through the Platform\n• No hormones administered (already federally prohibited for poultry and pork)\n• "Natural" meat must meet USDA definition: no artificial ingredients, minimally processed\n• Safe handling instructions and proper labeling required\n\nBAKED GOODS & PRESERVES:\n• All ingredients must comply with our prohibited substances list\n• Florida cottage food operators must label per FL §500.80\n• Ingredient lists in descending weight order required\n\nHONEY & SPECIALTY:\n• Must be raw, unprocessed, or minimally processed\n• No additives, corn syrup, or artificial sweeteners\n• Origin (apiary location) must be disclosed`,
      },
      {
        heading: '5. Labeling Requirements',
        content: `All products must include the following information in the product listing:\n• Complete ingredient list (descending order by weight)\n• Allergen declarations for all Big 9 allergens: milk, eggs, fish, shellfish, tree nuts, peanuts, wheat, soybeans, sesame\n• Net weight or count\n• Farm/producer name and location\n• Storage instructions (refrigeration requirements, shelf life)\n• "Best by" or harvest date where applicable\n\nFlorida cottage food products must include: "Made in a cottage food operation that is not subject to Florida's food safety regulations" in at least 10-point type.\n\nProducts making specific claims (organic, non-GMO, gluten-free) must have supporting documentation on file.`,
      },
      {
        heading: '6. Audit Rights & Enforcement',
        content: `FarmFresh Hub reserves the right to:\n• Request documentation supporting any product claim at any time\n• Conduct announced or unannounced audits of farming and production practices\n• Commission third-party laboratory testing of products\n• Investigate consumer complaints regarding product quality or compliance\n\nVIOLATION CONSEQUENCES:\n• First offense: Product removed from Platform, written notice, 14-day remediation period\n• Second offense: 30-day account suspension, mandatory compliance review\n• Third offense: Permanent removal from Platform\n• Willful misrepresentation of certifications: Immediate permanent removal\n• Food safety violation with risk of harm: Immediate suspension, reported to appropriate regulatory authorities\n\nMerchants may appeal enforcement decisions per the process described in our Community Guidelines.`,
      },
    ],
  },

  {
    id: 'cookies',
    title: 'Cookie Policy',
    lastUpdated: 'March 28, 2026',
    icon: '🍪',
    sections: [
      {
        heading: '1. What Are Cookies',
        content: `Cookies are small text files stored on your device when you visit a website or use a web application. FarmFresh Hub uses cookies and similar technologies (including web beacons, pixels, local storage, IndexedDB, Service Workers, and Cache API) to operate the Platform, remember your preferences, and understand how you use our services.\n\nThis Cookie Policy supplements our Privacy Policy and explains what cookies we use, why we use them, and how you can control them.\n\nContact: misiksolutionsllc@gmail.com`,
      },
      {
        heading: '2. Types of Cookies We Use',
        content: `ESSENTIAL COOKIES (Always Active — No Consent Required):\n• Authentication cookies: keep you logged in during your session\n• Security cookies: protect against CSRF attacks and unauthorized access\n• Cart cookies: preserve your shopping cart contents\n• Preference cookies: store your language, location, and display settings\n• Service Worker: enables offline functionality and push notifications for our PWA\n\nANALYTICS COOKIES (Require Consent in Some Jurisdictions):\n• Vercel Analytics: anonymous page view and performance metrics\n• Custom analytics: aggregated usage patterns to improve the Platform\n• Error tracking: crash reports and error logs for debugging\n\nFUNCTIONAL COOKIES (Require Consent in Some Jurisdictions):\n• Location preferences: remembering your default delivery address\n• Dietary preferences: personalizing product recommendations\n• Recently viewed: showing your recently browsed products\n\nWe do NOT use advertising or third-party tracking cookies. We do NOT participate in cross-site behavioral advertising networks.`,
      },
      {
        heading: '3. PWA-Specific Technologies',
        content: `FarmFresh Hub operates as a Progressive Web App (PWA). In addition to traditional cookies, we use:\n\nSERVICE WORKERS: Background scripts that enable offline access, push notifications, and performance caching. Service Workers do not track you across websites.\n\nINDEXEDDB & LOCAL STORAGE: Client-side databases storing your preferences, cached product data, and offline order queue. This data remains on your device and is not transmitted to our servers unless part of a user action (e.g., placing an order).\n\nCACHE API: Stores Platform assets (images, scripts, styles) locally for faster loading. Cached data is refreshed automatically.\n\nPUSH NOTIFICATIONS: Require separate explicit permission and are not bundled with cookie consent. You can manage push notification permissions in your device or browser settings at any time.`,
      },
      {
        heading: '4. Third-Party Services',
        content: `The following third-party services may set cookies or similar technologies when you use the Platform:\n\n• Vercel (vercel.com) — hosting and deployment analytics\n• Stripe (stripe.com) — payment processing and fraud prevention\n• Anthropic API (anthropic.com) — AI product recognition (server-side only, no client cookies)\n\nEach third-party service operates under its own privacy and cookie policies. We recommend reviewing their policies for details on their data practices.`,
      },
      {
        heading: '5. Your Choices & Controls',
        content: `You can control cookies through multiple methods:\n\nBROWSER SETTINGS: Most browsers allow you to block or delete cookies. Note that blocking essential cookies may prevent the Platform from functioning properly.\n\nGLOBAL PRIVACY CONTROL (GPC): We honor GPC signals sent by your browser. When detected, we automatically limit non-essential data collection.\n\n"DO NOT SELL OR SHARE" LINK: Available in the Platform footer and Privacy Settings. Exercising this right disables all non-essential analytics cookies.\n\nDO NOT TRACK (DNT): We respect DNT signals by disabling analytics cookies for users who enable DNT in their browser.\n\nPLATFORM SETTINGS: Manage your cookie preferences at any time in your Profile → Privacy & Security settings.`,
      },
      {
        heading: '6. International Visitors (GDPR)',
        content: `If you access the Platform from the European Union, European Economic Area, or United Kingdom, the following additional protections apply:\n\n• We will not place non-essential cookies until you provide explicit opt-in consent\n• You may accept or reject individual cookie categories\n• "Reject All" is as prominently displayed as "Accept All"\n• Pre-ticked consent boxes are not used\n• You may withdraw consent at any time with the same ease as giving it\n• Consent records are maintained for a minimum of 3 years\n\nOur legal basis for essential cookies is legitimate interest (necessary for the Platform to function). For analytics and functional cookies, the legal basis is your consent.`,
      },
      {
        heading: '7. Cookie Retention',
        content: `SESSION COOKIES: Deleted when you close your browser.\nPERSISTENT COOKIES: Retained for the following periods:\n• Authentication: 30 days (or until logout)\n• Preferences: 1 year\n• Analytics: 26 months\n• Security: 1 year\n\nWe conduct automated cookie audits quarterly to ensure our cookie inventory remains accurate and that no unauthorized cookies are deployed.\n\nThis Cookie Policy may be updated periodically. Changes will be reflected in the "Last Updated" date. Material changes affecting your consent will prompt a new consent request.\n\nContact: MISIKSOLUTIONS LLC\nEmail: misiksolutionsllc@gmail.com\nLocation: Wellington, Florida, United States`,
      },
    ],
  },
];
