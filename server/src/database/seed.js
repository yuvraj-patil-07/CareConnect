/**
 * Database Seed Script — CareConnect AI
 * 100+ realistic records for demo/development
 */

import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.model.js';
import Provider from '../models/Provider.model.js';
import Category from '../models/Category.model.js';
import Service from '../models/Service.model.js';
import { Skill } from '../models/Skill.model.js';
import Booking from '../models/Booking.model.js';
import Review from '../models/Review.model.js';
import { Coupon, SubscriptionPlan } from '../models/Coupon.model.js';
import Notification from '../models/Notification.model.js';

const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/careconnect';

// ─── Seed Data ────────────────────────────────────────────────────────────────

const categories = [
  { name: 'AC & Appliances', slug: 'ac-appliances', icon: 'FiAirplay', color: '#3B82F6', gradientFrom: '#3B82F6', gradientTo: '#1D4ED8', isPopular: true, isFeatured: true, sortOrder: 1, description: 'Air conditioner service, repair and installation' },
  { name: 'Cleaning', slug: 'cleaning', icon: 'FiStar', color: '#10B981', gradientFrom: '#10B981', gradientTo: '#059669', isPopular: true, isFeatured: true, sortOrder: 2, description: 'Home, office, and deep cleaning services' },
  { name: 'Plumbing', slug: 'plumbing', icon: 'FiDroplet', color: '#6366F1', gradientFrom: '#6366F1', gradientTo: '#4F46E5', isPopular: true, isFeatured: true, sortOrder: 3, description: 'Plumbing repair, installation and maintenance' },
  { name: 'Electrical', slug: 'electrical', icon: 'FiZap', color: '#F59E0B', gradientFrom: '#F59E0B', gradientTo: '#D97706', isPopular: true, isFeatured: true, sortOrder: 4, description: 'Electrical repair, wiring, and installation' },
  { name: 'Painting', slug: 'painting', icon: 'FiEdit3', color: '#EC4899', gradientFrom: '#EC4899', gradientTo: '#DB2777', isPopular: true, isFeatured: false, sortOrder: 5, description: 'Interior and exterior painting services' },
  { name: 'Carpentry', slug: 'carpentry', icon: 'FiTool', color: '#8B5CF6', gradientFrom: '#8B5CF6', gradientTo: '#7C3AED', isPopular: false, isFeatured: false, sortOrder: 6, description: 'Furniture repair, assembly, and custom carpentry' },
  { name: 'Pest Control', slug: 'pest-control', icon: 'FiShield', color: '#EF4444', gradientFrom: '#EF4444', gradientTo: '#DC2626', isPopular: true, isFeatured: false, sortOrder: 7, description: 'Cockroach, termite, and pest eradication' },
  { name: 'Home Shifting', slug: 'home-shifting', icon: 'FiPackage', color: '#F97316', gradientFrom: '#F97316', gradientTo: '#EA580C', isPopular: false, isFeatured: false, sortOrder: 8, description: 'Packing, moving, and shifting services' },
  { name: 'Interior Design', slug: 'interior-design', icon: 'FiHome', color: '#06B6D4', gradientFrom: '#06B6D4', gradientTo: '#0891B2', isPopular: false, isFeatured: true, sortOrder: 9, description: 'Interior design consultation and execution' },
  { name: 'Water Purifier', slug: 'water-purifier', icon: 'FiDroplet', color: '#14B8A6', gradientFrom: '#14B8A6', gradientTo: '#0D9488', isPopular: false, isFeatured: false, sortOrder: 10, description: 'RO and water purifier service and repair' },
  { name: 'Gardening', slug: 'gardening', icon: 'FiSun', color: '#84CC16', gradientFrom: '#84CC16', gradientTo: '#65A30D', isPopular: false, isFeatured: false, sortOrder: 11, description: 'Garden maintenance, landscaping, and plantation' },
  { name: 'Security Systems', slug: 'security-systems', icon: 'FiCamera', color: '#64748B', gradientFrom: '#64748B', gradientTo: '#475569', isPopular: false, isFeatured: false, sortOrder: 12, description: 'CCTV, alarm, and security system installation' },
];

const skills = [
  { name: 'AC Technician', description: 'Air conditioner service and repair', demandLevel: 'very_high' },
  { name: 'Washing Machine Repair', description: 'All brands washing machine repair', demandLevel: 'high' },
  { name: 'Refrigerator Repair', description: 'Refrigerator compressor and cooling repair', demandLevel: 'high' },
  { name: 'Plumber', description: 'Pipe fitting, leakage repair, installation', demandLevel: 'very_high' },
  { name: 'Electrician', description: 'Wiring, switch, fan, light installation', demandLevel: 'very_high' },
  { name: 'House Painter', description: 'Interior and exterior painting', demandLevel: 'high' },
  { name: 'Carpenter', description: 'Furniture repair, assembly, woodwork', demandLevel: 'medium' },
  { name: 'Deep Cleaning Specialist', description: 'Full home deep cleaning', demandLevel: 'high' },
  { name: 'Pest Control Expert', description: 'Cockroach, termite, ant treatment', demandLevel: 'medium' },
  { name: 'Packers & Movers', description: 'Packing and relocating household', demandLevel: 'medium' },
  { name: 'CCTV Technician', description: 'Camera installation and maintenance', demandLevel: 'medium' },
  { name: 'RO Technician', description: 'Water purifier service and repair', demandLevel: 'medium' },
  { name: 'Geyser Repair', description: 'Water heater installation and repair', demandLevel: 'high' },
  { name: 'Microwave Repair', description: 'Microwave oven service and repair', demandLevel: 'medium' },
  { name: 'TV Repair', description: 'LED, LCD, Smart TV repair', demandLevel: 'medium' },
  { name: 'Sofa Cleaning', description: 'Upholstery and sofa deep cleaning', demandLevel: 'medium' },
  { name: 'Bathroom Cleaning', description: 'Deep bathroom and toilet cleaning', demandLevel: 'high' },
  { name: 'Garden Maintenance', description: 'Plant care, trimming, lawn mowing', demandLevel: 'low' },
  { name: 'False Ceiling', description: 'POP and gypsum false ceiling work', demandLevel: 'medium' },
  { name: 'Tile & Flooring', description: 'Tile fixing and floor installation', demandLevel: 'medium' },
];

const providerProfiles = [
  {
    name: 'Rahul Sharma', email: 'rahul.sharma@example.com', phone: '9876543210',
    city: 'Mumbai', bio: 'Expert AC technician with 8 years of experience.',
    yearsOfExperience: 8, languages: ['Hindi', 'English', 'Marathi'],
    trustScore: 92, averageRating: 4.8, totalRatings: 234,
    lat: 19.0760, lng: 72.8777, isTopProvider: true, isSuperPro: true,
  },
  {
    name: 'Priya Nair', email: 'priya.nair@example.com', phone: '9876543211',
    city: 'Bangalore', bio: 'Professional deep cleaning specialist. Eco-friendly products.',
    yearsOfExperience: 5, languages: ['Kannada', 'English', 'Tamil'],
    trustScore: 88, averageRating: 4.7, totalRatings: 189,
    lat: 12.9716, lng: 77.5946, isTopProvider: true,
  },
  {
    name: 'Amit Kumar', email: 'amit.kumar@example.com', phone: '9876543212',
    city: 'Delhi', bio: 'Licensed electrician. 10+ years experience. All electrical works.',
    yearsOfExperience: 10, languages: ['Hindi', 'Punjabi'],
    trustScore: 95, averageRating: 4.9, totalRatings: 312,
    lat: 28.6139, lng: 77.2090, isTopProvider: true, isSuperPro: true,
  },
  {
    name: 'Sunita Reddy', email: 'sunita.reddy@example.com', phone: '9876543213',
    city: 'Hyderabad', bio: 'Expert plumber. Fast response, quality work guaranteed.',
    yearsOfExperience: 7, languages: ['Telugu', 'Hindi'],
    trustScore: 85, averageRating: 4.6, totalRatings: 156,
    lat: 17.3850, lng: 78.4867,
  },
  {
    name: 'Mohammed Ali', email: 'mohammed.ali@example.com', phone: '9876543214',
    city: 'Chennai', bio: 'Professional painter. Interior and exterior, texture and wall art.',
    yearsOfExperience: 12, languages: ['Tamil', 'Telugu', 'English'],
    trustScore: 90, averageRating: 4.8, totalRatings: 267,
    lat: 13.0827, lng: 80.2707, isTopProvider: true,
  },
  {
    name: 'Kavita Joshi', email: 'kavita.joshi@example.com', phone: '9876543215',
    city: 'Pune', bio: 'Certified pest control technician. Safe, organic treatments.',
    yearsOfExperience: 6, languages: ['Hindi', 'Marathi'],
    trustScore: 82, averageRating: 4.5, totalRatings: 98,
    lat: 18.5204, lng: 73.8567,
  },
  {
    name: 'Rajesh Patel', email: 'rajesh.patel@example.com', phone: '9876543216',
    city: 'Ahmedabad', bio: 'Experienced carpenter. Custom furniture, repair, renovation.',
    yearsOfExperience: 15, languages: ['Gujarati', 'Hindi'],
    trustScore: 87, averageRating: 4.7, totalRatings: 143,
    lat: 23.0225, lng: 72.5714,
  },
  {
    name: 'Deepa Menon', email: 'deepa.menon@example.com', phone: '9876543217',
    city: 'Kochi', bio: 'AC and appliance repair specialist. Samsung/LG/Voltas authorized.',
    yearsOfExperience: 9, languages: ['Malayalam', 'English'],
    trustScore: 91, averageRating: 4.8, totalRatings: 201,
    lat: 9.9312, lng: 76.2673,
  },
  {
    name: 'Suresh Gowda', email: 'suresh.gowda@example.com', phone: '9876543218',
    city: 'Bangalore', bio: 'Full home cleaning and sanitization. Team of 5 professionals.',
    yearsOfExperience: 4, languages: ['Kannada', 'English'],
    trustScore: 79, averageRating: 4.4, totalRatings: 72,
    lat: 12.9345, lng: 77.6101,
  },
  {
    name: 'Anita Singh', email: 'anita.singh@example.com', phone: '9876543219',
    city: 'Lucknow', bio: 'Professional geyser and water heater repair. Quick service.',
    yearsOfExperience: 6, languages: ['Hindi'],
    trustScore: 84, averageRating: 4.6, totalRatings: 87,
    lat: 26.8467, lng: 80.9462,
  },
];

const customers = [
  { name: 'Aditya Verma', email: 'aditya.verma@example.com', phone: '9811111111', city: 'Mumbai' },
  { name: 'Neha Gupta', email: 'neha.gupta@example.com', phone: '9811111112', city: 'Delhi' },
  { name: 'Vikram Malhotra', email: 'vikram.malhotra@example.com', phone: '9811111113', city: 'Bangalore' },
  { name: 'Sneha Rao', email: 'sneha.rao@example.com', phone: '9811111114', city: 'Hyderabad' },
  { name: 'Arjun Kapoor', email: 'arjun.kapoor@example.com', phone: '9811111115', city: 'Pune' },
  { name: 'Meera Shah', email: 'meera.shah@example.com', phone: '9811111116', city: 'Ahmedabad' },
  { name: 'Rohit Bajaj', email: 'rohit.bajaj@example.com', phone: '9811111117', city: 'Chennai' },
  { name: 'Pooja Iyer', email: 'pooja.iyer@example.com', phone: '9811111118', city: 'Kochi' },
  { name: 'Sanjay Mishra', email: 'sanjay.mishra@example.com', phone: '9811111119', city: 'Lucknow' },
  { name: 'Divya Krishnan', email: 'divya.krishnan@example.com', phone: '9811111120', city: 'Hyderabad' },
  { name: 'Karan Mehta', email: 'karan.mehta@example.com', phone: '9811111121', city: 'Mumbai' },
  { name: 'Isha Trivedi', email: 'isha.trivedi@example.com', phone: '9811111122', city: 'Jaipur' },
  { name: 'Manish Dubey', email: 'manish.dubey@example.com', phone: '9811111123', city: 'Bhopal' },
  { name: 'Radha Pillai', email: 'radha.pillai@example.com', phone: '9811111124', city: 'Kochi' },
  { name: 'Tarun Khanna', email: 'tarun.khanna@example.com', phone: '9811111125', city: 'Delhi' },
];

const reviewComments = [
  { comment: 'Excellent service! The technician arrived on time and fixed the AC perfectly. Very professional.', rating: 5 },
  { comment: 'Good work overall. Fixed the issue but took a bit longer than expected.', rating: 4 },
  { comment: 'Very professional and clean. The cleaning team did an amazing job. Will book again.', rating: 5 },
  { comment: 'Prompt response and quality repair. Highly recommended!', rating: 5 },
  { comment: 'The plumber was skilled but slightly overpriced. Work quality was good.', rating: 4 },
  { comment: 'Outstanding service! Fixed the electrical issue in under an hour. Very satisfied.', rating: 5 },
  { comment: 'Average work. Had to call back for minor touchups. Eventually resolved.', rating: 3 },
  { comment: 'Superb painting job! The walls look brand new. Very detail-oriented team.', rating: 5 },
  { comment: 'Professional pest control treatment. No sign of cockroaches after 3 months.', rating: 5 },
  { comment: 'The carpenter was creative and did exactly what I wanted. Love the furniture!', rating: 5 },
];

const coupons = [
  { code: 'WELCOME50', title: 'New User Discount', type: 'percentage', value: 50, maxDiscount: 300, minOrderValue: 500, validFrom: new Date(), validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), isActive: true, isPublic: true },
  { code: 'FLAT200', title: 'Flat ₹200 Off', type: 'flat', value: 200, minOrderValue: 800, validFrom: new Date(), validUntil: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), isActive: true, isPublic: true },
  { code: 'AC10', title: '10% Off AC Service', type: 'percentage', value: 10, maxDiscount: 500, minOrderValue: 299, validFrom: new Date(), validUntil: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), isActive: true, isPublic: true },
  { code: 'CLEAN30', title: '30% Off Cleaning', type: 'percentage', value: 30, maxDiscount: 400, minOrderValue: 599, validFrom: new Date(), validUntil: new Date(Date.now() + 45 * 24 * 60 * 60 * 1000), isActive: true, isPublic: true },
  { code: 'EMERGENCY15', title: 'Emergency Booking Discount', type: 'percentage', value: 15, maxDiscount: 250, minOrderValue: 0, validFrom: new Date(), validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), isActive: true, isPublic: false },
];

const subscriptionPlans = [
  {
    name: 'Care Plus', slug: 'care-plus', type: 'customer',
    price: 299, billingCycle: 'monthly',
    features: [
      { name: '2 Free Inspections', description: 'Get 2 free service inspections per month', isHighlight: true },
      { name: 'Priority Booking', description: 'Skip the queue with priority booking', isHighlight: true },
      { name: '10% Discount', description: '10% off all services', isHighlight: false },
      { name: 'Dedicated Support', description: '24/7 dedicated customer support', isHighlight: true },
    ],
    freeInspections: 2, priorityBooking: true, discountPercentage: 10,
    dedicatedSupport: true, isActive: true, isPopular: true, color: '#2563EB', sortOrder: 1,
  },
  {
    name: 'Care Elite', slug: 'care-elite', type: 'customer',
    price: 699, billingCycle: 'monthly',
    features: [
      { name: '5 Free Inspections', description: '5 free service inspections monthly', isHighlight: true },
      { name: 'Priority + Emergency', description: 'Priority + 3 emergency bookings', isHighlight: true },
      { name: '20% Discount', description: '20% off all services', isHighlight: true },
      { name: 'Home Health Report', description: 'Monthly AI home health report', isHighlight: true },
    ],
    freeInspections: 5, priorityBooking: true, discountPercentage: 20,
    dedicatedSupport: true, emergencyBookings: 3, isActive: true, color: '#7C3AED', sortOrder: 2,
  },
  {
    name: 'Pro Provider', slug: 'pro-provider', type: 'provider',
    price: 499, billingCycle: 'monthly',
    features: [
      { name: 'Unlimited Leads', description: 'Get unlimited booking leads', isHighlight: true },
      { name: 'Reduced Commission', description: '5% commission discount', isHighlight: true },
      { name: 'Profile Badge', description: 'Pro Provider badge on profile', isHighlight: false },
      { name: 'Analytics Dashboard', description: 'Detailed business analytics', isHighlight: true },
    ],
    leadsPerMonth: 999, commissionDiscount: 5,
    isActive: true, isPopular: true, color: '#059669', sortOrder: 3,
  },
];

// ─── Main Seed Function ───────────────────────────────────────────────────────

const seed = async () => {
  console.log('🌱 Starting database seed...\n');

  await mongoose.connect(MONGO_URI);
  console.log('✅ Connected to MongoDB\n');

  // Clear existing data
  console.log('🗑️  Clearing existing data...');
  await Promise.all([
    User.deleteMany({}), Provider.deleteMany({}),
    Category.deleteMany({}), Service.deleteMany({}),
    Skill.deleteMany({}), Booking.deleteMany({}),
    Review.deleteMany({}), Coupon.deleteMany({}),
    SubscriptionPlan.deleteMany({}), Notification.deleteMany({}),
  ]);
  console.log('✅ Database cleared\n');

  // ── Admin user ──────────────────────────────────────────────────────────────
  console.log('👤 Creating admin user...');
  const adminUser = await User.create({
    name: 'CareConnect Admin',
    email: 'admin@careconnect.ai',
    phone: '9999999999',
    password: 'Admin@123456',
    role: 'admin',
    isVerified: true,
    isActive: true,
    wallet: { balance: 10000, coins: 5000 },
  });
  console.log(`  ✅ Admin: admin@careconnect.ai / Admin@123456`);

  // Operations Manager
  const opsUser = await User.create({
    name: 'Ops Manager',
    email: 'ops@careconnect.ai',
    phone: '9999999998',
    password: 'Ops@123456',
    role: 'operations_manager',
    isVerified: true, isActive: true,
  });

  // Support Agent
  const supportUser = await User.create({
    name: 'Support Agent',
    email: 'support@careconnect.ai',
    phone: '9999999997',
    password: 'Support@123456',
    role: 'support_agent',
    isVerified: true, isActive: true,
  });
  console.log(`  ✅ Ops: ops@careconnect.ai | Support: support@careconnect.ai\n`);

  // ── Categories ──────────────────────────────────────────────────────────────
  console.log('📁 Creating categories...');
  const createdCategories = await Category.insertMany(categories);
  console.log(`  ✅ ${createdCategories.length} categories created\n`);

  // ── Skills ──────────────────────────────────────────────────────────────────
  console.log('🔧 Creating skills...');
  const createdSkills = await Skill.insertMany(skills.map((s) => ({
    ...s,
    slug: s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    category: createdCategories[0]._id,
  })));
  console.log(`  ✅ ${createdSkills.length} skills created\n`);

  // ── Services ────────────────────────────────────────────────────────────────
  console.log('🛠️  Creating services...');
  const servicesData = [
    { name: 'AC Service & Repair', category: createdCategories[0]._id, basePrice: 499, maxPrice: 2000, estimatedDuration: 60, isPopular: true, isFeatured: true, description: 'Complete AC service including gas refill, filter cleaning, and repair' },
    { name: 'Deep Home Cleaning', category: createdCategories[1]._id, basePrice: 799, maxPrice: 3000, estimatedDuration: 180, isPopular: true, isFeatured: true, description: 'Full home deep cleaning with eco-friendly products' },
    { name: 'Bathroom Cleaning', category: createdCategories[1]._id, basePrice: 399, maxPrice: 800, estimatedDuration: 60, isPopular: true, description: 'Professional bathroom deep cleaning and sanitization' },
    { name: 'Pipe Leakage Fix', category: createdCategories[2]._id, basePrice: 299, maxPrice: 2000, estimatedDuration: 45, isPopular: true, description: 'Quick pipe leakage detection and repair' },
    { name: 'Geyser Installation', category: createdCategories[2]._id, basePrice: 399, maxPrice: 1500, estimatedDuration: 60, isPopular: false, description: 'Water heater/geyser installation and connection' },
    { name: 'Fan Installation', category: createdCategories[3]._id, basePrice: 199, maxPrice: 500, estimatedDuration: 30, isPopular: true, description: 'Ceiling fan installation and wiring' },
    { name: 'Full Home Wiring', category: createdCategories[3]._id, basePrice: 2999, maxPrice: 15000, estimatedDuration: 480, isPopular: false, description: 'Complete home electrical wiring with safety inspection' },
    { name: 'Interior Painting', category: createdCategories[4]._id, basePrice: 1999, maxPrice: 15000, estimatedDuration: 480, isPopular: true, description: 'Full interior painting with premium paints' },
    { name: 'Texture Painting', category: createdCategories[4]._id, basePrice: 2499, maxPrice: 20000, estimatedDuration: 480, isPopular: false, description: 'Decorative texture wall painting' },
    { name: 'Furniture Assembly', category: createdCategories[5]._id, basePrice: 299, maxPrice: 1500, estimatedDuration: 90, isPopular: true, description: 'IKEA and other furniture assembly service' },
    { name: 'Cockroach Treatment', category: createdCategories[6]._id, basePrice: 499, maxPrice: 1500, estimatedDuration: 60, isPopular: true, description: 'Gel-based cockroach treatment, child-safe' },
    { name: 'Termite Control', category: createdCategories[6]._id, basePrice: 999, maxPrice: 5000, estimatedDuration: 120, isPopular: false, description: 'Anti-termite treatment for wooden furniture and walls' },
    { name: 'Washing Machine Repair', category: createdCategories[0]._id, basePrice: 399, maxPrice: 2500, estimatedDuration: 60, isPopular: true, description: 'All brands washing machine diagnosis and repair' },
    { name: 'Refrigerator Repair', category: createdCategories[0]._id, basePrice: 499, maxPrice: 3000, estimatedDuration: 90, isPopular: true, description: 'Fridge cooling issues, compressor, and electrical repair' },
    { name: 'Sofa/Carpet Cleaning', category: createdCategories[1]._id, basePrice: 599, maxPrice: 2000, estimatedDuration: 120, isPopular: false, description: 'Steam cleaning for sofas, carpets, and curtains' },
  ];

  const createdServices = await Service.insertMany(servicesData.map((s) => ({
    ...s,
    slug: s.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    priceUnit: 'visit',
    isActive: true,
    aiClassificationKeywords: [s.name.toLowerCase()],
  })));
  console.log(`  ✅ ${createdServices.length} services created\n`);

  // ── Provider Users ──────────────────────────────────────────────────────────
  console.log('👷 Creating providers...');
  const providerUsers = [];
  for (const p of providerProfiles) {
    const user = await User.create({
      name: p.name, email: p.email, phone: p.phone,
      password: 'Provider@123',
      role: 'provider',
      city: p.city,
      isVerified: true, isActive: true,
      wallet: { balance: Math.floor(Math.random() * 5000) + 500, coins: Math.floor(Math.random() * 200) },
    });
    providerUsers.push({ user, data: p });
  }

  const providerDocs = [];
  for (let i = 0; i < providerUsers.length; i++) {
    const { user, data } = providerUsers[i];
    const catIndex = i % createdCategories.length;
    const provider = await Provider.create({
      user: user._id,
      businessName: `${data.name.split(' ')[0]}'s Services`,
      tagline: data.bio.substring(0, 80),
      bio: data.bio,
      yearsOfExperience: data.yearsOfExperience,
      categories: [createdCategories[catIndex]._id],
      skills: [createdSkills[i % createdSkills.length]._id],
      languages: data.languages,
      verificationStatus: 'verified',
      verifiedAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000),
      backgroundCheckStatus: 'clear',
      currentLocation: { type: 'Point', coordinates: [data.lng, data.lat] },
      serviceRadius: 25,
      serviceCities: [data.city],
      isAvailable: true,
      isOnline: Math.random() > 0.4,
      averageRating: data.averageRating,
      totalRatings: data.totalRatings,
      trustScore: data.trustScore,
      isTopProvider: data.isTopProvider || false,
      isSuperPro: data.isSuperPro || false,
      isFeatured: Math.random() > 0.6,
      ecoScore: { score: Math.floor(Math.random() * 40) + 60, greenCertified: Math.random() > 0.7 },
      stats: {
        totalJobs: data.totalRatings + Math.floor(Math.random() * 50),
        completedJobs: data.totalRatings,
        cancelledJobs: Math.floor(Math.random() * 10),
        completionRate: Math.floor(Math.random() * 10) + 90,
        avgResponseTime: Math.floor(Math.random() * 20) + 5,
        totalEarnings: Math.floor(Math.random() * 200000) + 50000,
        thisMonthEarnings: Math.floor(Math.random() * 20000) + 5000,
      },
      ratingDistribution: {
        5: Math.floor(data.totalRatings * 0.7),
        4: Math.floor(data.totalRatings * 0.2),
        3: Math.floor(data.totalRatings * 0.06),
        2: Math.floor(data.totalRatings * 0.02),
        1: Math.floor(data.totalRatings * 0.02),
      },
      workingHours: {
        monday: { start: '08:00', end: '20:00', isWorking: true },
        tuesday: { start: '08:00', end: '20:00', isWorking: true },
        wednesday: { start: '08:00', end: '20:00', isWorking: true },
        thursday: { start: '08:00', end: '20:00', isWorking: true },
        friday: { start: '08:00', end: '20:00', isWorking: true },
        saturday: { start: '09:00', end: '18:00', isWorking: true },
        sunday: { start: '10:00', end: '16:00', isWorking: Math.random() > 0.5 },
      },
      badges: [
        { name: 'Verified Pro', icon: '✅', earnedAt: new Date(), description: 'Background verified' },
        ...(data.isTopProvider ? [{ name: 'Top Rated', icon: '⭐', earnedAt: new Date(), description: 'Top rated in category' }] : []),
      ],
    });
    providerDocs.push(provider);
  }
  console.log(`  ✅ ${providerDocs.length} providers created\n`);

  // ── Customer Users ──────────────────────────────────────────────────────────
  console.log('👤 Creating customers...');
  const customerUsers = [];
  for (const c of customers) {
    const user = await User.create({
      name: c.name, email: c.email, phone: c.phone,
      password: 'Customer@123',
      role: 'customer', city: c.city,
      isVerified: true, isActive: true,
      wallet: { balance: Math.floor(Math.random() * 2000) + 100, coins: Math.floor(Math.random() * 500) + 50 },
      subscription: { plan: Math.random() > 0.7 ? 'premium' : 'free', status: 'active' },
    });
    customerUsers.push(user);
  }
  console.log(`  ✅ ${customerUsers.length} customers created\n`);

  // ── Bookings ────────────────────────────────────────────────────────────────
  console.log('📋 Creating bookings...');
  const bookingStatuses = ['completed', 'completed', 'completed', 'cancelled', 'pending', 'accepted'];
  const cities = [
    { name: 'Mumbai', lat: 19.0760, lng: 72.8777 },
    { name: 'Delhi', lat: 28.6139, lng: 77.2090 },
    { name: 'Bangalore', lat: 12.9716, lng: 77.5946 },
  ];

  const bookings = [];
  for (let i = 0; i < 40; i++) {
    const customer = customerUsers[i % customerUsers.length];
    const provider = providerDocs[i % providerDocs.length];
    const service = createdServices[i % createdServices.length];
    const city = cities[i % cities.length];
    const status = bookingStatuses[i % bookingStatuses.length];
    const scheduledDate = new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000);
    const amount = Math.floor(Math.random() * 2000) + 300;
    const platformFee = Math.round(amount * 0.15);
    const providerEarning = amount - platformFee;

    const booking = await Booking.create({
      customer: customer._id,
      provider: provider._id,
      service: service._id,
      category: service.category,
      description: `Need ${service.name.toLowerCase()} service at my home. Please bring necessary tools.`,
      scheduledDate,
      scheduledTimeSlot: { start: '10:00', end: '12:00' },
      serviceLocation: {
        address: `${Math.floor(Math.random() * 999) + 1} Main Street`,
        city: city.name,
        state: 'Maharashtra',
        pincode: '400001',
        coordinates: { type: 'Point', coordinates: [city.lng, city.lat] },
      },
      status,
      totalAmount: amount,
      finalPrice: amount,
      platformFee,
      providerEarning,
      gstAmount: Math.round(amount * 0.18),
      gstRate: 18,
      paymentStatus: status === 'completed' ? 'paid' : 'pending',
      paymentMethod: status === 'completed' ? 'upi' : undefined,
      actualStartTime: status === 'completed' ? new Date(scheduledDate.getTime() + 60 * 60 * 1000) : undefined,
      actualEndTime: status === 'completed' ? new Date(scheduledDate.getTime() + 2 * 60 * 60 * 1000) : undefined,
      actualDuration: status === 'completed' ? 60 : undefined,
      completionConfirmed: status === 'completed',
      hasReview: false,
      statusHistory: [{ status, changedAt: scheduledDate }],
      source: 'web',
    });
    bookings.push(booking);
  }
  console.log(`  ✅ ${bookings.length} bookings created\n`);

  // ── Reviews ─────────────────────────────────────────────────────────────────
  console.log('⭐ Creating reviews...');
  const completedBookings = bookings.filter((b) => b.status === 'completed');
  let reviewCount = 0;
  for (let i = 0; i < Math.min(completedBookings.length, reviewComments.length); i++) {
    const booking = completedBookings[i];
    const reviewData = reviewComments[i % reviewComments.length];
    await Review.create({
      booking: booking._id,
      customer: booking.customer,
      provider: booking.provider,
      service: booking.service,
      overallRating: reviewData.rating,
      qualityRating: Math.min(5, reviewData.rating + (Math.random() > 0.5 ? 0 : -1)),
      punctualityRating: reviewData.rating,
      behaviorRating: 5,
      valueRating: Math.min(5, reviewData.rating),
      comment: reviewData.comment,
      isApproved: true,
      isPublic: true,
      sentiment: {
        score: reviewData.rating >= 4 ? 0.7 : reviewData.rating === 3 ? 0 : -0.4,
        label: reviewData.rating >= 4 ? 'positive' : reviewData.rating === 3 ? 'neutral' : 'negative',
        keywords: ['professional', 'clean', 'efficient'],
        analyzedAt: new Date(),
      },
    });
    await Booking.findByIdAndUpdate(booking._id, { hasReview: true });
    reviewCount++;
  }
  console.log(`  ✅ ${reviewCount} reviews created\n`);

  // ── Coupons ─────────────────────────────────────────────────────────────────
  console.log('🎟️  Creating coupons...');
  await Coupon.insertMany(coupons.map((c) => ({ ...c, createdBy: adminUser._id })));
  console.log(`  ✅ ${coupons.length} coupons created\n`);

  // ── Subscription Plans ──────────────────────────────────────────────────────
  console.log('💎 Creating subscription plans...');
  await SubscriptionPlan.insertMany(subscriptionPlans);
  console.log(`  ✅ ${subscriptionPlans.length} subscription plans created\n`);

  // ── Notifications ───────────────────────────────────────────────────────────
  console.log('🔔 Creating notifications...');
  const notificationData = customerUsers.slice(0, 5).map((user) => ({
    recipient: user._id,
    type: 'system',
    title: 'Welcome to CareConnect AI! 🎉',
    message: 'Explore our 200+ services and book your first service today.',
    priority: 'normal',
    isRead: false,
  }));
  await Notification.insertMany(notificationData);
  console.log(`  ✅ ${notificationData.length} notifications created\n`);

  console.log('═'.repeat(60));
  console.log('🎉 Database seeded successfully!\n');
  console.log('📧 Login Credentials:');
  console.log('   Admin:    admin@careconnect.ai  / Admin@123456');
  console.log('   Ops Mgr:  ops@careconnect.ai    / Ops@123456');
  console.log('   Support:  support@careconnect.ai / Support@123456');
  console.log('   Provider: rahul.sharma@example.com / Provider@123');
  console.log('   Customer: aditya.verma@example.com / Customer@123');
  console.log('═'.repeat(60));

  await mongoose.disconnect();
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
