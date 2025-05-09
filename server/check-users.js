import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://aaaaryaannn:r9J2T4WMCNMjmJGm@tga.ajmql56.mongodb.net/maharashtra_tour_guide";

async function checkUsers() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB!');
    
    const db = client.db('maharashtra_tour_guide');
    
    // Get all users and guide profiles
    const users = await db.collection('users').find({}).toArray();
    const guideProfiles = await db.collection('guideProfiles').find({}).toArray();
    
    // Create a map of guide profiles by userId
    const profileMap = new Map(guideProfiles.map(profile => [profile.userId, profile]));
    
    // Separate mock users (from seed data) and registered users
    const mockGuides = users.filter(user => 
      user.userType === 'guide' && 
      ['aditya_guide', 'priya_guide', 'raj_guide'].includes(user.username)
    );
    
    const registeredGuides = users.filter(user => 
      user.userType === 'guide' && 
      !['aditya_guide', 'priya_guide', 'raj_guide'].includes(user.username)
    );
    
    const tourists = users.filter(user => user.userType === 'tourist');
    
    console.log('\nUser Statistics:');
    console.log('----------------');
    console.log(`Total Users: ${users.length}`);
    console.log(`Mock Guides: ${mockGuides.length}`);
    console.log(`Registered Guides: ${registeredGuides.length}`);
    console.log(`Tourists: ${tourists.length}`);
    console.log(`Guide Profiles: ${guideProfiles.length}`);
    
    console.log('\nMock Guides:');
    mockGuides.forEach(guide => {
      const profile = profileMap.get(guide._id.toString());
      console.log(`- ${guide.fullName} (${guide.username})`);
      console.log(`  ID: ${guide._id}`);
      console.log(`  User Type: ${guide.userType}`);
      console.log(`  Has Profile: ${profile ? 'Yes' : 'No'}`);
      if (profile) {
        console.log(`  Location: ${profile.location}`);
        console.log(`  Languages: ${profile.languages?.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('\nRegistered Guides:');
    registeredGuides.forEach(guide => {
      const profile = profileMap.get(guide._id.toString());
      console.log(`- ${guide.fullName} (${guide.username})`);
      console.log(`  ID: ${guide._id}`);
      console.log(`  User Type: ${guide.userType}`);
      console.log(`  Has Profile: ${profile ? 'Yes' : 'No'}`);
      if (profile) {
        console.log(`  Location: ${profile.location}`);
        console.log(`  Languages: ${profile.languages?.join(', ')}`);
      }
      console.log('');
    });
    
    console.log('\nTourists:');
    tourists.forEach(tourist => {
      console.log(`- ${tourist.fullName} (${tourist.username})`);
      console.log(`  ID: ${tourist._id}`);
      console.log(`  User Type: ${tourist.userType}`);
      console.log('');
    });
    
  } catch (error) {
    console.error('Error checking users:', error);
  } finally {
    await client.close();
  }
}

// Run the check
checkUsers().catch(console.error); 