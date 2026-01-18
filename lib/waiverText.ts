/**
 * Structured waiver text content for PDF generation.
 * This mirrors the content in components/WaiverContent.tsx but in a format
 * suitable for jsPDF generation.
 */

export type WaiverSection = {
  title: string;
  content: string;
  bullets?: string[];
  subsections?: {
    title: string;
    bullets: string[];
  }[];
  isUppercase?: boolean;
};

export type WaiverContent = {
  title: string;
  intro: string;
  additionalIntro?: string;
  sections: WaiverSection[];
};

export type AssetType = 'golf_cart' | 'bike' | 'hot_tub';

export const golfCartWaiverText: WaiverContent = {
  title: 'GOLF CART RENTAL AGREEMENT AND WAIVER OF LIABILITY',
  intro: 'This Golf Cart Rental Agreement and Waiver of Liability ("Agreement") is between the undersigned guest ("Renter") and the property owner/host ("Host"). CartHost is a technology provider facilitating this process on behalf of the Host.',
  sections: [
    {
      title: '1. ELIGIBILITY AND DRIVER RESPONSIBILITY',
      content:
        'I represent that I am at least 18 years old (or the minimum legal age to operate a motor vehicle in this jurisdiction, if higher) and hold a current, valid driver\'s license. I agree that only licensed drivers who have been authorized by the Host and who have agreed to this Agreement will operate the golf cart.',
    },
    {
      title: '2. ASSUMPTION OF RISK',
      content:
        'I UNDERSTAND THAT OPERATING A GOLF CART INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS, ROLLOVERS, LOSS OF CONTROL, SERIOUS INJURY, DEATH, AND PROPERTY DAMAGE. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND ANY MINOR OR GUEST I ALLOW TO RIDE IN OR OPERATE THE CART.',
      isUppercase: true,
    },
    {
      title: '3. RELEASE OF LIABILITY',
      content:
        'To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or causes of action arising out of or related to my use or operation of the golf cart, including those arising from ordinary negligence. This release does not apply to any liability that cannot be waived under applicable law, including gross negligence, willful misconduct, or intentional harm.',
    },
    {
      title: '4. INDEMNIFICATION',
      content:
        'I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or related to: (a) my use or operation of the golf cart; (b) any use or operation by a person I allow to drive the cart; or (c) injury to third parties or damage to third-party property in connection with the cart.',
    },
    {
      title: '5. RESPONSIBILITY FOR DAMAGE AND CHARGES',
      content:
        'I agree that I am responsible for any loss of or damage to the golf cart occurring during my rental period, normal wear and tear excepted. I understand that the Host may seek recovery for such damage through any applicable security deposit, damage waiver, or platform resolution process, and, where applicable for direct bookings, I authorize the Host to charge the payment method on file for repair or replacement costs resulting from my use, negligence, or accident.',
    },
    {
      title: '6. RULES OF OPERATION',
      content: 'I agree to operate the golf cart in a safe and lawful manner and specifically agree that:',
      bullets: [
        'I will obey all local traffic laws, posted signs, and speed limits.',
        'I will NOT operate the cart while under the influence of alcohol, drugs, or any substance that may impair my ability to drive safely.',
        'I will NOT allow any underage or unlicensed person to operate the cart.',
        'I will ensure all passengers are seated properly while the cart is moving.',
        'I will ensure the cart is plugged in and charging when not in use and at the end of my stay, in accordance with the Host\'s instructions.',
      ],
    },
    {
      title: '7. CONDITION OF VEHICLE',
      content:
        'I acknowledge that I have inspected the golf cart (including by reviewing and/or providing photos through the CartHost app) and accept it in its current condition. I agree to promptly report to the Host any damage or mechanical issues that arise during my rental period.',
    },
    {
      title: '8. ACKNOWLEDGMENT AND CONSENT',
      content:
        'By clicking "I Agree" or otherwise electronically signing below, I acknowledge that I have read this Agreement in full, understand its terms, and voluntarily agree to be bound by it. I understand that by signing this Agreement, I may be waiving certain legal rights, including the right to sue the Host for ordinary negligence, to the fullest extent permitted by law.',
    },
  ],
};

export const bikeWaiverText: WaiverContent = {
  title: 'BICYCLE / E-BIKE RENTAL AGREEMENT AND WAIVER OF LIABILITY',
  intro: 'This Bicycle / E-Bike Rental Agreement and Waiver of Liability ("Agreement") is between the undersigned guest ("Renter") and the property owner/host ("Host"). CartHost is a technology provider facilitating this process on behalf of the Host.',
  additionalIntro:
    'For purposes of this Agreement, "Bicycle" includes any bicycle, e-bike, or similar micromobility device provided by the Host, and all included accessories (such as helmets, locks, lights, baskets, or child seats).',
  sections: [
    {
      title: '1. ELIGIBILITY AND RIDER RESPONSIBILITY',
      content: 'I represent that:',
      bullets: [
        'I am at least 18 years old (or the minimum legal age to operate the Bicycle in this jurisdiction, if higher).',
        'I am physically able and competent to ride a bicycle and, if applicable, an e-bike.',
        'I will ensure that any minor or additional rider using the Bicycle does so only: with the Host\'s permission, in compliance with applicable age, height, and weight limits, and under my direct supervision.',
      ],
    },
    {
      title: '2. ASSUMPTION OF RISK',
      content:
        'I UNDERSTAND THAT RIDING A BICYCLE OR E-BIKE INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO COLLISIONS WITH MOTOR VEHICLES, PEDESTRIANS, OBJECTS, OR OTHER CYCLISTS; LOSS OF CONTROL; EQUIPMENT FAILURE; DANGEROUS ROAD CONDITIONS; WEATHER-RELATED HAZARDS; SERIOUS INJURY; PARALYSIS; DEATH; AND PROPERTY DAMAGE. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND FOR ANY MINOR OR GUEST I ALLOW TO RIDE THE BICYCLE, WHETHER AS A RIDER OR PASSENGER (INCLUDING IN ANY CHILD SEAT OR TRAILER).',
      isUppercase: true,
    },
    {
      title: '3. RELEASE OF LIABILITY',
      content:
        'To the fullest extent permitted by law, I hereby release, waive, and discharge the Host, the property owner, their officers, employees, agents, and the technology provider CartHost from any and all liability, claims, demands, or causes of action arising out of or related to my use or operation of the Bicycle, including those arising from ordinary negligence. This release does not apply to any liability that cannot be waived under applicable law, including gross negligence, willful misconduct, or intentional harm.',
    },
    {
      title: '4. INDEMNIFICATION',
      content:
        'I agree to indemnify, defend, and hold harmless the Host and the property owner from any and all claims, damages, losses, costs, and expenses (including reasonable attorneys\' fees) arising out of or related to:',
      bullets: [
        'My use or operation of the Bicycle;',
        'Any use or operation of the Bicycle by a person I allow to ride it; or',
        'Injury to third parties or damage to third-party property in connection with the Bicycle.',
      ],
    },
    {
      title: '5. RESPONSIBILITY FOR DAMAGE, LOSS, AND CHARGES',
      content:
        'I agree that I am responsible for any loss of, theft of, or damage to the Bicycle and its accessories occurring during my rental period, normal wear and tear excepted. I understand and agree that:',
      bullets: [
        'I am responsible for properly securing the Bicycle with the provided lock and following the Host\'s instructions on where and how to park and lock it.',
        'If the Bicycle is lost, stolen, or returned with damage beyond normal wear and tear, the Host may seek recovery for repair or replacement costs through any applicable security deposit, damage waiver, or platform resolution process.',
        'Where applicable for direct bookings, I authorize the Host to charge the payment method on file for such repair or replacement costs resulting from my use, negligence, or accident.',
      ],
    },
    {
      title: '6. RULES OF OPERATION',
      content: 'I agree to operate the Bicycle in a safe and lawful manner and specifically agree that:',
      subsections: [
        {
          title: 'Traffic Laws & Routes',
          bullets: [
            'I will obey all local traffic laws, signals, and signs, and ride only where bicycles are legally allowed.',
            'I will ride with the flow of traffic, not against it, and use bike lanes where available and appropriate.',
            'I will not ride on sidewalks or restricted paths where prohibited by law or by Host rules.',
          ],
        },
        {
          title: 'Alcohol, Drugs, and Impairment',
          bullets: [
            'I will NOT operate the Bicycle while under the influence of alcohol, drugs, or any substance that may impair my ability to ride safely.',
          ],
        },
        {
          title: 'Riders and Passengers',
          bullets: [
            'I will NOT allow any underage or unauthorized person to ride the Bicycle, whether as a rider or passenger, except as permitted by the Host and local law (for example, a child in an approved child seat).',
            'I will not carry more riders than the Bicycle is designed or rated for.',
          ],
        },
        {
          title: 'Safe Riding Practices',
          bullets: [
            'I will operate the Bicycle at a safe speed for conditions and will not perform stunts, jumps, or other high-risk maneuvers.',
            'I will use caution on hills, wet or uneven surfaces, gravel, and other hazardous conditions.',
            'If riding at night or in low-visibility conditions, I will use lights and reflectors as required by law and exercise extra care.',
          ],
        },
        {
          title: 'Locking and Returning the Bicycle',
          bullets: [
            'I will follow the Host\'s instructions for where to park and how to lock the Bicycle, including securing the frame to a fixed object when required.',
            'At the end of my stay, I will return the Bicycle in substantially the same condition as at the start of my rental, normal wear and tear excepted, and I will follow any instructions (including taking and uploading required photos) to confirm proper locking and return.',
          ],
        },
      ],
    },
    {
      title: '7. CONDITION OF BICYCLE AND REPORTING ISSUES',
      content:
        'I acknowledge that I have inspected the Bicycle (including by reviewing and/or providing photos through the CartHost experience) and accept it in its current condition. Before riding, I will inspect the Bicycle for obvious defects, including brakes, tires, wheels, handlebars, pedals, and lights. If I notice any damage, malfunction, or unsafe condition:',
      bullets: [
        'I will NOT ride the Bicycle until the issue is resolved; and',
        'I will promptly report the issue to the Host.',
      ],
    },
    {
      title: '8. ACKNOWLEDGMENT, PHOTOS, AND CONSENT',
      content:
        'I understand that the Host may require me to upload photos or other information (for example, photos of the Bicycle at the start and end of my ride, and photos confirming the Bicycle was properly locked) through CartHost to document the condition of the Bicycle and my compliance with these rules. By clicking "I Agree" or otherwise electronically signing below, I acknowledge that:',
      bullets: [
        'I have read this Agreement in full;',
        'I understand its terms and the risks involved in riding the Bicycle; and',
        'I voluntarily agree to be bound by this Agreement.',
      ],
    },
  ],
};

export const hotTubWaiverText: WaiverContent = {
  title: 'HOT TUB RENTAL AGREEMENT AND WAIVER OF LIABILITY',
  intro: 'This Hot Tub Rental Agreement and Waiver of Liability ("Agreement") is between the undersigned guest ("Renter") and the property owner/host ("Host"). CartHost is a technology provider facilitating this process on behalf of the Host.',
  sections: [
    {
      title: '1. ELIGIBILITY AND HEALTH WARNINGS',
      content:
        'I represent that I am at least 18 years old and competent to sign this Agreement. I acknowledge the following health warnings:',
      bullets: [
        'Medical Conditions: People with heart disease, low or high blood pressure, diabetes, or circulatory system problems should consult a physician before using the hot tub.',
        'Pregnancy: Pregnant women should consult a physician before use, as high water temperatures can harm a fetus.',
        'Medication & Alcohol: The use of alcohol, drugs, or medication before or during hot tub use may lead to unconsciousness with the possibility of drowning.',
      ],
    },
    {
      title: '2. ASSUMPTION OF RISK',
      content:
        'I UNDERSTAND THAT USING A HOT TUB INVOLVES INHERENT RISKS, INCLUDING BUT NOT LIMITED TO: DROWNING, HEAT STROKE/HYPERTHERMIA, SLIP-AND-FALL INJURIES ON WET SURFACES, SKIN SENSITIVITY TO CHEMICALS, AND INFECTION. I VOLUNTARILY ASSUME ALL SUCH RISKS FOR MYSELF AND FOR ANY MINOR OR GUEST I ALLOW TO USE THE HOT TUB.',
      isUppercase: true,
    },
    {
      title: '3. RELEASE OF LIABILITY',
      content:
        'To the fullest extent permitted by law, I release, waive, and discharge the Host, the property owner, their agents, and CartHost from any and all liability, claims, or causes of action arising out of or related to my use of the hot tub, including those arising from ordinary negligence.',
    },
    {
      title: '4. RULES OF OPERATION',
      content:
        'I agree to follow these rules to ensure safety and prevent damage, and I understand that I am responsible for ensuring that all members of my party and any guests follow them as well:',
      bullets: [
        'No Glass: I will strictly prohibit glass bottles or containers in or near the hot tub. (Broken glass requires a complete drain and clean at my expense.)',
        'No Added Substances: I will not add soaps, oils, bubbles, dyes, food, or any other foreign substances to the water.',
        'Shower First: I will ensure all users shower before entering to remove lotions, oils, and makeup that damage the filters.',
        'Cover Care: I will replace and secure the cover immediately after use to maintain heat and safety and will NOT sit, stand, or lie on the cover.',
        'Supervision: Children must be supervised by an adult at all times.',
        'Unsanitary Water: If the water appears cloudy, foamy, or otherwise unsanitary, I will stop using the hot tub and notify the Host.',
        'Posted Rules: I will comply with all posted rules and manufacturer guidelines regarding temperature, soaking time, and maximum occupancy.',
      ],
    },
    {
      title: '5. RESPONSIBILITY FOR DAMAGE / EXTRA CLEANING',
      content:
        'I agree that I am responsible for any damage to the hot tub, equipment, or cover caused by misuse, negligence, or failure to follow these rules by myself or my guests. I understand that the Host may charge for drain-and-fill services and extra cleaning (typically $100-$300 or the actual cost incurred) if the water is rendered unusable due to foreign substances (including but not limited to glass, food, soap, oils, or bodily fluids) introduced during my rental.',
    },
    {
      title: '6. INDEMNIFICATION',
      content:
        'I agree to indemnify and hold the Host harmless from any claims, damages, or expenses (including reasonable attorney\'s fees) arising out of my use of the hot tub or that of any member of my party or guest.',
    },
    {
      title: '7. ACKNOWLEDGMENT',
      content:
        'By clicking "I Agree" below, I acknowledge that I have read this Agreement, understand the risks, and voluntarily agree to be bound by its terms.',
    },
  ],
};

export function getWaiverContent(assetType: AssetType): WaiverContent {
  switch (assetType) {
    case 'golf_cart':
      return golfCartWaiverText;
    case 'bike':
      return bikeWaiverText;
    case 'hot_tub':
      return hotTubWaiverText;
    default:
      return golfCartWaiverText;
  }
}

export function getWaiverDisplayName(assetType: AssetType): string {
  switch (assetType) {
    case 'golf_cart':
      return 'Golf Cart';
    case 'bike':
      return 'Bicycle / E-Bike';
    case 'hot_tub':
      return 'Hot Tub';
    default:
      return 'Golf Cart';
  }
}
