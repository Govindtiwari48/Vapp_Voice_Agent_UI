export const campaigns = {
  incoming: [
    {
      id: 'INC001',
      name: 'Property Inquiry - Premium Listings',
      status: 'active',
      totalCalls: 145,
      successfulCalls: 98,
      avgDuration: '4:32',
      createdDate: '2025-10-15',
      allocatedDid: '798784112',
      callLogs: [
        {
          id: 'CALL001',
          phoneNumber: '+1 (555) 123-4567',
          duration: '5:23',
          date: '2025-11-12',
          time: '09:15 AM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording1.mp3',
          transcript: `Agent: Hello, thank you for calling Premium Properties. How can I help you today?
          
Customer: Hi, I'm looking for a 3-bedroom apartment in downtown Manhattan.

Agent: Excellent! I'd be happy to help you with that. What's your budget range?

Customer: I'm looking at around $800,000 to $1,000,000.

Agent: Perfect. And when are you looking to move in?

Customer: Ideally within the next 3 months.

Agent: Great! We have several properties that match your criteria. Would you like me to schedule a viewing?

Customer: Yes, that would be great. Can we do it this weekend?

Agent: Absolutely. I'll arrange that for you. Let me get your email to send the details.`,
          leadQualification: 'show-project',
          keywords: {
            budget: '$800,000 - $1,000,000',
            location: 'Downtown Manhattan',
            bedrooms: '3 BHK',
            moveInDate: 'Within 3 months',
            intent: 'High - Ready to view'
          },
          sentiment: 'positive',
          nextAction: 'Schedule viewing this weekend',
          spendInr: 7.26,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'Buyer ready for a 3 BHK in downtown Manhattan with ~$800k-$1M budget and locked a weekend viewing.',
          dispositionType: 'Successful',
          recommendedAction: 'Send Info on WhatsApp',
          transcriptPdfUrl: 'https://example.com/transcripts/call001.pdf'
        },
        {
          id: 'CALL002',
          phoneNumber: '+1 (555) 234-5678',
          duration: '3:45',
          date: '2025-11-12',
          time: '10:30 AM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording2.mp3',
          transcript: `Agent: Good morning, Premium Properties speaking.

Customer: Hello, I saw your listing for the penthouse in Brooklyn. Is it still available?

Agent: Yes, it is! That's a beautiful 4-bedroom penthouse with amazing city views. May I ask your budget?

Customer: I'm flexible, but preferably under $1.5 million.

Agent: That works perfectly. The listing is at $1.45 million. Would you like to schedule a callback with our senior agent?

Customer: Yes, please. Tomorrow afternoon would be great.

Agent: Perfect, I'll arrange that. Can I get your name and best contact number?`,
          leadQualification: 'callback',
          keywords: {
            budget: 'Under $1.5M',
            location: 'Brooklyn',
            bedrooms: '4 BHK (Penthouse)',
            propertyType: 'Penthouse',
            intent: 'High - Requested callback'
          },
          sentiment: 'positive',
          nextAction: 'Senior agent callback tomorrow afternoon',
          spendInr: 6.1,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'High-intent penthouse prospect (budget < $1.5M) requested a senior agent callback for tomorrow afternoon.',
          dispositionType: 'Successful',
          recommendedAction: 'Schedule Call',
          transcriptPdfUrl: 'https://example.com/transcripts/call002.pdf'
        },
        {
          id: 'CALL003',
          phoneNumber: '+1 (555) 345-6789',
          duration: '2:18',
          date: '2025-11-12',
          time: '11:45 AM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording3.mp3',
          transcript: `Agent: Thank you for calling Premium Properties.

Customer: Hi, I'm just browsing. Do you have properties in Queens?

Agent: Yes, we do! We have a wide range. What type of property are you looking for?

Customer: Maybe a 2-bedroom condo. But I'm just starting to look.

Agent: That's great! What's your approximate budget range?

Customer: Around $500,000 to $600,000.

Agent: Excellent. We have several options in that range. Would you like me to email you some listings?

Customer: Sure, that would be helpful.`,
          leadQualification: 'show-project',
          keywords: {
            budget: '$500K - $600K',
            location: 'Queens',
            bedrooms: '2 BHK',
            propertyType: 'Condo',
            intent: 'Medium - Early stage browsing'
          },
          sentiment: 'neutral',
          nextAction: 'Send property listings via email',
          spendInr: 5.75,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'Early-stage 2 BHK condo searcher in Queens with $500-600K budget—email curated options.',
          dispositionType: 'Successful',
          recommendedAction: 'Send Info on WhatsApp',
          transcriptPdfUrl: 'https://example.com/transcripts/call003.pdf'
        }
      ]
    },
    {
      id: 'INC002',
      name: 'Affordable Housing Inquiries',
      status: 'active',
      totalCalls: 89,
      successfulCalls: 56,
      avgDuration: '3:45',
      createdDate: '2025-10-20',
      allocatedDid: '778845221',
      callLogs: [
        {
          id: 'CALL004',
          phoneNumber: '+1 (555) 456-7890',
          duration: '4:12',
          date: '2025-11-11',
          time: '02:20 PM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording4.mp3',
          transcript: `Agent: Hello, Premium Properties, how may I assist you?

Customer: I'm looking for an affordable 1-bedroom apartment.

Agent: Certainly! Which area are you interested in?

Customer: Somewhere in Queens or the Bronx.

Agent: Great choices. What's your budget?

Customer: Around $300,000 to $400,000.

Agent: Perfect. I can show you several options. When would be a good time for viewings?`,
          leadQualification: 'show-project',
          keywords: {
            budget: '$300K - $400K',
            location: 'Queens or Bronx',
            bedrooms: '1 BHK',
            intent: 'Medium - Interested in viewings'
          },
          sentiment: 'positive',
          nextAction: 'Schedule property viewings',
          spendInr: 4.95,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'Affordable 1 BHK buyer (Queens/Bronx, $300-400K) ready to view shortlisted units.',
          dispositionType: 'Successful',
          recommendedAction: 'Setup Site Visit',
          transcriptPdfUrl: 'https://example.com/transcripts/call004.pdf'
        }
      ]
    }
  ],
  outgoing: [
    {
      id: 'OUT001',
      name: 'Follow-up: Previous Inquiries',
      status: 'active',
      totalCalls: 67,
      successfulCalls: 45,
      avgDuration: '3:15',
      createdDate: '2025-10-25',
      allocatedDid: '909877612',
      callLogs: [
        {
          id: 'CALL005',
          phoneNumber: '+1 (555) 567-8901',
          duration: '3:52',
          date: '2025-11-12',
          time: '03:30 PM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording5.mp3',
          transcript: `Agent: Hello, this is Sarah from Premium Properties. Am I speaking with Mr. Johnson?

Customer: Yes, speaking.

Agent: Hi Mr. Johnson! I'm following up on your inquiry about the 3-bedroom condo in Manhattan last week. Have you had a chance to think about it?

Customer: Oh yes! I'm still interested. I was actually planning to call you back.

Agent: Wonderful! The property is still available. Would you like to schedule a viewing?

Customer: Yes, definitely. How about this Saturday?

Agent: Saturday works great. I'll confirm the time and send you the details via email.

Customer: Perfect, thank you!`,
          leadQualification: 'show-project',
          keywords: {
            budget: 'Previously discussed',
            location: 'Manhattan',
            bedrooms: '3 BHK',
            propertyType: 'Condo',
            intent: 'High - Confirmed viewing'
          },
          sentiment: 'positive',
          nextAction: 'Confirm Saturday viewing details',
          spendInr: 6.9,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'Previous 3 BHK lead reconfirmed interest and booked a Saturday viewing; send invite & prep brochure.',
          dispositionType: 'Successful',
          recommendedAction: 'Setup Site Visit',
          transcriptPdfUrl: 'https://example.com/transcripts/call005.pdf'
        },
        {
          id: 'CALL006',
          phoneNumber: '+1 (555) 678-9012',
          duration: '2:05',
          date: '2025-11-12',
          time: '04:15 PM',
          status: 'no-answer',
          recordingUrl: null,
          transcript: 'No answer - Left voicemail',
          leadQualification: 'callback',
          keywords: {
            budget: 'N/A',
            location: 'N/A',
            intent: 'Unknown - No contact'
          },
          sentiment: 'neutral',
          nextAction: 'Retry call tomorrow',
          spendInr: 2.1,
          recordingFormat: 'mp3',
          transcriptionFormat: 'text',
          transcriptionSummary: 'Voicemail left; retry the outreach tomorrow.',
          dispositionType: 'Unsuccessful',
          recommendedAction: 'Call',
          transcriptPdfUrl: null
        }
      ]
    },
    {
      id: 'OUT002',
      name: 'New Property Announcements',
      status: 'paused',
      totalCalls: 124,
      successfulCalls: 87,
      avgDuration: '2:45',
      createdDate: '2025-11-01',
      allocatedDid: '667801244',
      callLogs: [
        {
          id: 'CALL007',
          phoneNumber: '+1 (555) 789-0123',
          duration: '4:30',
          date: '2025-11-10',
          time: '10:00 AM',
          status: 'completed',
          recordingUrl: 'https://example.com/recording7.mp3',
          transcript: `Agent: Good morning! This is Michael from Premium Properties. I'm calling to inform you about our new luxury development in Upper East Side.

Customer: Oh, interesting. Tell me more.

Agent: It's a brand new building with studios to 3-bedroom units. Prices start from $650,000. Premium amenities including gym, rooftop pool, and concierge service.

Customer: That sounds great. What's the budget for a 2-bedroom?

Agent: 2-bedroom units are priced between $900,000 to $1.1 million, depending on the floor and view.

Customer: I might be interested. Can you send me more details?

Agent: Absolutely! I'll email you the complete brochure and floor plans. Would you also like to schedule a site visit?

Customer: Let me review the details first, then I'll get back to you.

Agent: Perfect! I'll send everything over today.`,
          leadQualification: 'show-project',
          keywords: {
            budget: '$900K - $1.1M',
            location: 'Upper East Side',
            bedrooms: '2 BHK',
            propertyType: 'New Development',
            amenities: 'Gym, Pool, Concierge',
            intent: 'Medium - Requested information'
          },
          sentiment: 'positive',
          nextAction: 'Send brochure and await response',
          spendInr: 5.45,
          recordingFormat: 'mp3',
          transcriptionFormat: 'pdf',
          transcriptionSummary: 'Upper East Side launch piqued interest; prospect wants brochure before committing to a visit.',
          dispositionType: 'Successful',
          recommendedAction: 'Send Info on WhatsApp',
          transcriptPdfUrl: 'https://example.com/transcripts/call007.pdf'
        }
      ]
    }
  ]
};

export const getCampaignById = (type, id) => {
  return campaigns[type].find(c => c.id === id);
};

export const getCallById = (campaignType, campaignId, callId) => {
  const campaign = getCampaignById(campaignType, campaignId);
  return campaign?.callLogs.find(c => c.id === callId);
};

