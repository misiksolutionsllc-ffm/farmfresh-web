// US State-specific requirements for farm-to-table sellers
// Auto-detected by farm address state

export interface StateRequirement {
  state: string;
  stateCode: string;
  documents: {
    id: string;
    name: string;
    description: string;
    required: boolean;
    category: 'license' | 'food_safety' | 'business' | 'tax' | 'insurance';
  }[];
  trainingTopics: string[];
  specialNotes?: string;
}

export const US_STATE_REQUIREMENTS: Record<string, StateRequirement> = {
  FL: {
    state: 'Florida',
    stateCode: 'FL',
    documents: [
      { id: 'business_license', name: 'Business License', description: 'Florida Business Tax Receipt or local business license', required: true, category: 'license' },
      { id: 'cottage_food', name: 'Cottage Food Permit', description: 'FL Cottage Food Operations permit (if applicable)', required: false, category: 'food_safety' },
      { id: 'food_permit', name: 'Food Establishment Permit', description: 'Florida DBPR food establishment permit', required: true, category: 'food_safety' },
      { id: 'sales_tax', name: 'Sales Tax Certificate', description: 'FL Dept of Revenue sales tax registration', required: true, category: 'tax' },
      { id: 'liability_insurance', name: 'Liability Insurance', description: 'General liability insurance certificate', required: true, category: 'insurance' },
      { id: 'food_handler', name: 'Food Handler Certificate', description: 'Florida food handler training certificate', required: true, category: 'food_safety' },
    ],
    trainingTopics: ['Florida Cottage Food Laws', 'Food Safety & Handling', 'Labeling Requirements', 'Sales Tax Collection'],
    specialNotes: 'Florida allows cottage food operations up to $250K/year without a food establishment license.',
  },
  CA: {
    state: 'California',
    stateCode: 'CA',
    documents: [
      { id: 'business_license', name: 'Business License', description: 'California business license from your county', required: true, category: 'license' },
      { id: 'cfp_permit', name: 'California Food Processor License', description: 'CDFA Certified Farmers Market certificate or food processor registration', required: true, category: 'food_safety' },
      { id: 'health_permit', name: 'Health Department Permit', description: 'County health department food facility permit', required: true, category: 'food_safety' },
      { id: 'sellers_permit', name: "Seller's Permit", description: 'California CDTFA sellers permit for tax collection', required: true, category: 'tax' },
      { id: 'liability_insurance', name: 'Liability Insurance', description: 'Product liability insurance ($1M minimum recommended)', required: true, category: 'insurance' },
      { id: 'organic_cert', name: 'Organic Certification', description: 'USDA Organic certification (if claiming organic)', required: false, category: 'food_safety' },
    ],
    trainingTopics: ['California Cottage Food Act (AB 1616)', 'Prop 65 Labeling', 'Food Safety Modernization Act', 'Organic Claims Compliance'],
    specialNotes: 'CA has two tiers of cottage food: Class A (direct sales only) and Class B (indirect sales allowed).',
  },
  TX: {
    state: 'Texas',
    stateCode: 'TX',
    documents: [
      { id: 'business_license', name: 'Business License', description: 'Texas business registration or DBA filing', required: true, category: 'license' },
      { id: 'food_handler', name: 'Food Handler Card', description: 'Texas food handler certification (DSHS approved)', required: true, category: 'food_safety' },
      { id: 'cottage_food', name: 'Cottage Food Registration', description: 'Texas cottage food production operation registration', required: false, category: 'food_safety' },
      { id: 'sales_tax', name: 'Sales Tax Permit', description: 'Texas Comptroller sales tax permit', required: true, category: 'tax' },
      { id: 'liability_insurance', name: 'Liability Insurance', description: 'General liability insurance', required: true, category: 'insurance' },
    ],
    trainingTopics: ['Texas Cottage Food Law', 'Food Safety Standards', 'Labeling Requirements', 'Sales Tax Exemptions'],
    specialNotes: 'Texas allows cottage food sales up to $50K/year from home without a food establishment license.',
  },
  NY: {
    state: 'New York',
    stateCode: 'NY',
    documents: [
      { id: 'business_license', name: 'Business License', description: 'New York State business registration', required: true, category: 'license' },
      { id: 'food_license', name: 'Food Processing License', description: 'NYS Dept of Agriculture food processing license', required: true, category: 'food_safety' },
      { id: 'health_permit', name: 'Health Department Permit', description: 'Local health department food service permit', required: true, category: 'food_safety' },
      { id: 'sales_tax', name: 'Sales Tax Certificate', description: 'NYS certificate of authority for sales tax', required: true, category: 'tax' },
      { id: 'liability_insurance', name: 'Liability Insurance', description: 'Product liability insurance ($2M recommended)', required: true, category: 'insurance' },
      { id: 'food_handler', name: 'Food Safety Certificate', description: 'ServSafe or equivalent food safety certification', required: true, category: 'food_safety' },
    ],
    trainingTopics: ['NY Home Processor Exemption', 'Food Safety Certification', 'Labeling & Allergen Requirements', 'NYS Tax Collection'],
  },
};

// Default for states not in the database
export const DEFAULT_REQUIREMENTS: StateRequirement = {
  state: 'United States',
  stateCode: 'US',
  documents: [
    { id: 'business_license', name: 'Business License', description: 'State or local business license/registration', required: true, category: 'license' },
    { id: 'food_safety', name: 'Food Safety Certification', description: 'ServSafe or equivalent food handler certificate', required: true, category: 'food_safety' },
    { id: 'sales_tax', name: 'Sales Tax Registration', description: 'State sales tax registration or permit', required: true, category: 'tax' },
    { id: 'liability_insurance', name: 'Liability Insurance', description: 'General liability insurance certificate', required: true, category: 'insurance' },
  ],
  trainingTopics: ['Federal Food Safety Regulations', 'Proper Food Handling & Storage', 'Labeling Requirements', 'Record Keeping'],
};

export function getStateRequirements(stateCode: string): StateRequirement {
  return US_STATE_REQUIREMENTS[stateCode.toUpperCase()] || DEFAULT_REQUIREMENTS;
}

// Training quiz questions
export interface QuizQuestion {
  id: string;
  question: string;
  options: string[];
  correctIndex: number;
  topic: string;
}

export const TRAINING_QUIZ: QuizQuestion[] = [
  {
    id: 'q1', topic: 'Food Safety',
    question: 'What is the maximum safe temperature for storing perishable foods?',
    options: ['50°F (10°C)', '40°F (4°C)', '32°F (0°C)', '45°F (7°C)'],
    correctIndex: 1,
  },
  {
    id: 'q2', topic: 'Labeling',
    question: 'Which of the following MUST appear on a food product label?',
    options: ['Farm logo', 'Product name, ingredients, allergens, net weight, producer info', 'Only the product name', 'A barcode'],
    correctIndex: 1,
  },
  {
    id: 'q3', topic: 'Natural Food Policy',
    question: 'EdemFarm ONLY allows products that are:',
    options: ['Any food products', 'Natural, non-GMO, free from synthetic pesticides & chemicals', 'Organic certified only', 'Locally grown within 10 miles'],
    correctIndex: 1,
  },
  {
    id: 'q4', topic: 'Food Safety',
    question: 'How often should you check refrigeration temperatures?',
    options: ['Once a week', 'Once a month', 'At least daily', 'Only when equipment looks broken'],
    correctIndex: 2,
  },
  {
    id: 'q5', topic: 'Compliance',
    question: 'If a customer reports an allergic reaction to your product, you should:',
    options: ['Ignore it', 'Document the incident, pull the product, and report to health authorities', 'Offer a refund only', 'Delete the review'],
    correctIndex: 1,
  },
  {
    id: 'q6', topic: 'Natural Food Policy',
    question: 'Which product would NOT be allowed on EdemFarm?',
    options: ['Organic heirloom tomatoes', 'Free-range eggs', 'Conventional produce sprayed with synthetic pesticides', 'Raw local honey'],
    correctIndex: 2,
  },
];

// Company policy text
export const NATURAL_FOOD_POLICY = `
## EdemFarm Natural Food Pledge

By joining EdemFarm as a Farmer American Hero, you commit to the following standards:

### Product Standards
- **100% Natural**: All products must be naturally grown, raised, or produced
- **No GMOs**: Genetically modified organisms are strictly prohibited
- **No Synthetic Pesticides**: Chemical pesticides and herbicides are not allowed
- **No Artificial Additives**: No artificial colors, flavors, preservatives, or sweeteners
- **Transparent Sourcing**: You must be able to trace every product to its origin

### Quality Commitments
- Products must be fresh and within safe consumption dates
- Proper cold chain must be maintained for perishable items
- Accurate labeling including all ingredients and allergens
- Immediate recall cooperation if any safety issue arises

### Accountability
- Random quality audits may be conducted
- Customer complaints are investigated within 24 hours
- Violations may result in temporary suspension or permanent removal
- Three verified violations result in permanent platform ban

By accepting, you acknowledge that EdemFarm serves communities who trust us to deliver clean, natural food. This trust is our most valuable asset.
`;
