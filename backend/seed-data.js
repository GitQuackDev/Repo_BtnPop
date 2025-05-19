require('dotenv').config();
const mongoose = require('mongoose');
const News = require('./models/News');
const Event = require('./models/Event');

// Sample news data
const newsData = [
  {
    title: 'BTN Association Announces New Community Programs',
    subtitle: 'Expanding support for local initiatives',
    content: `<p>BTN Association is proud to announce a series of new community programs designed to support local initiatives and foster community engagement.</p>
    <p>The programs will focus on education, environmental sustainability, and cultural development, providing resources and funding for grassroots projects.</p>
    <p>"We believe in the power of community-driven change," said the BTN Association President. "These programs will help amplify the impact of local initiatives."</p>`,
    author: 'BTN Editorial Team',
    category: 'Feature',
    tags: ['community', 'programs', 'initiatives'],
    featured: true,
    trending: false,
    slug: 'btn-association-announces-new-community-programs'
  },
  {
    title: 'Annual Cultural Festival Returns Next Month',
    subtitle: 'Celebrating diversity through art, music, and food',
    content: `<p>The highly anticipated annual Cultural Festival is returning next month, bringing together diverse communities to celebrate through art, music, food, and performances.</p>
    <p>This year's festival will feature more than 50 exhibitors, 20 food vendors, and performances from local and international artists.</p>
    <p>The event will take place at Central Park from June 15-18, 2023, with free admission for all attendees.</p>`,
    author: 'Events Team',
    category: 'Latest',
    tags: ['festival', 'culture', 'community'],
    featured: false,
    trending: true,
    slug: 'annual-cultural-festival-returns'
  },
  {
    title: 'New Technology Initiative for Youth Education',
    subtitle: 'Bridging the digital divide in underserved communities',
    content: `<p>BTN Association has launched a new technology initiative aimed at bridging the digital divide in underserved communities.</p>
    <p>The program will provide computers, internet access, and digital literacy training to youth in communities with limited access to technology.</p>
    <p>"In today's digital world, access to technology is essential for educational success," said the program director. "We're committed to ensuring all youth have the tools they need."</p>`,
    author: 'Education Reporter',
    category: 'General',
    tags: ['technology', 'education', 'youth'],
    featured: false,
    trending: false,
    slug: 'new-technology-initiative-youth-education'
  },
  {
    title: 'Local Artist Showcase Highlights Emerging Talent',
    subtitle: 'Spotlight on the next generation of creative voices',
    content: `<p>The Local Artist Showcase held last weekend highlighted emerging talent from across the region, providing a platform for up-and-coming creatives to share their work.</p>
    <p>The event featured exhibitions from painters, sculptors, photographers, and digital artists, drawing hundreds of attendees from the community.</p>
    <p>"This showcase is crucial for emerging artists to gain visibility and connect with potential patrons," said the gallery curator.</p>`,
    author: 'Arts Correspondent',
    category: 'Latest',
    tags: ['art', 'local', 'exhibition'],
    featured: false,
    trending: true,
    slug: 'local-artist-showcase-emerging-talent'
  },
  {
    title: 'Environmental Conservation Project Launches',
    subtitle: 'Community-led effort to protect local ecosystems',
    content: `<p>A new environmental conservation project has launched with the aim of protecting and restoring local ecosystems through community involvement.</p>
    <p>The initiative includes regular clean-up events, native plant restoration, and educational workshops on conservation practices.</p>
    <p>"Our environment belongs to all of us, and it's our collective responsibility to protect it," said the project coordinator.</p>`,
    author: 'Environmental Reporter',
    category: 'Feature',
    tags: ['environment', 'conservation', 'community'],
    featured: true,
    trending: false,
    slug: 'environmental-conservation-project-launches'
  }
];

// Sample events data
const eventsData = [
  {
    title: 'Annual Community Conference',
    description: `<p>Join us for our Annual Community Conference, where community leaders, activists, and residents come together to discuss important issues facing our neighborhood.</p>
    <p>This year's theme is "Building Resilient Communities," with keynote speakers, panel discussions, and interactive workshops.</p>
    <p>Registration includes access to all sessions, lunch, and networking opportunities.</p>`,
    eventDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days in the future
    location: 'Community Center, 123 Main Street',
    organizer: 'BTN Association',
    category: 'Conference',
    registrationRequired: true,
    registrationUrl: 'https://btnassociation.org/annual-conference',
    isFeatured: true,
    slug: 'annual-community-conference'
  },
  {
    title: 'Youth Leadership Workshop',
    description: `<p>A one-day workshop designed to help young people develop leadership skills, confidence, and community engagement.</p>
    <p>The workshop will cover topics such as public speaking, project management, team building, and community organizing.</p>
    <p>Open to youth ages 14-21. Lunch and materials will be provided.</p>`,
    eventDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days in the future
    location: 'Youth Center, 456 Oak Avenue',
    organizer: 'Youth Empowerment Network',
    category: 'Workshop',
    registrationRequired: true,
    registrationUrl: 'https://btnassociation.org/youth-workshop',
    isFeatured: false,
    slug: 'youth-leadership-workshop'
  },
  {
    title: 'Community Garden Volunteer Day',
    description: `<p>Help maintain and beautify our community garden! No experience necessary - all tools and guidance will be provided.</p>
    <p>Activities include planting, weeding, composting, and general garden maintenance. This is a great opportunity to meet neighbors and learn about urban gardening.</p>
    <p>Please wear appropriate clothing for outdoor work and bring a water bottle. Light refreshments will be provided.</p>`,
    eventDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days in the future
    location: 'Community Garden, 789 Green Street',
    organizer: 'Green Spaces Initiative',
    category: 'Other',
    registrationRequired: false,
    isFeatured: false,
    slug: 'community-garden-volunteer-day'
  },
  {
    title: 'Cultural Heritage Festival',
    description: `<p>Celebrate the diverse cultural heritage of our community with music, dance, food, and art from around the world.</p>
    <p>The festival will feature performances on multiple stages, a global food market, craft vendors, and interactive cultural exhibits.</p>
    <p>This family-friendly event is free and open to the public. Join us for a day of celebration and cultural exchange!</p>`,
    eventDate: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), // 45 days in the future
    endDate: new Date(Date.now() + 47 * 24 * 60 * 60 * 1000), // 47 days in the future (3-day event)
    location: 'Riverside Park',
    organizer: 'Cultural Alliance',
    category: 'Exhibition',
    registrationRequired: false,
    isFeatured: true,
    slug: 'cultural-heritage-festival'
  },
  {
    title: 'Tech for Social Good Hackathon',
    description: `<p>A weekend-long hackathon focused on developing technology solutions for local social challenges.</p>
    <p>Participants will work in teams to create prototypes that address issues such as education access, environmental sustainability, public health, and community connection.</p>
    <p>Open to developers, designers, and anyone interested in using technology for social impact. Prizes will be awarded to the top projects.</p>`,
    eventDate: new Date(Date.now() + 21 * 24 * 60 * 60 * 1000), // 21 days in the future
    endDate: new Date(Date.now() + 23 * 24 * 60 * 60 * 1000), // 23 days in the future (3-day event)
    location: 'Innovation Hub, 101 Tech Street',
    organizer: 'Code for Community',
    category: 'Workshop',
    registrationRequired: true,
    registrationUrl: 'https://btnassociation.org/tech-hackathon',
    isFeatured: false,
    slug: 'tech-social-good-hackathon'
  }
];

// Connect to MongoDB and seed data
async function seedDatabase() {
  try {
    // Connect to MongoDB
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB Connected');
    
    // Clear existing data
    console.log('Clearing existing data...');
    await News.deleteMany({});
    await Event.deleteMany({});
    
    // Insert seed data
    console.log('Inserting seed data...');
    await News.insertMany(newsData);
    await Event.insertMany(eventsData);
    
    console.log('✅ Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run seeder
seedDatabase();
