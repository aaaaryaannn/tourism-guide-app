import { db } from "./db";
import { initializeDatabase } from "./db";

async function checkItineraries() {
  try {
    // Make sure the database is connected
    await initializeDatabase();
    
    console.log("Connected to MongoDB database successfully");
    
    // Check for itineraries collection
    const collections = await db.listCollections().toArray();
    if (collections.find(c => c.name === 'itineraries')) {
      console.log("Itineraries collection exists");
      
      // Count itineraries
      const itineraryCount = await db.collection('itineraries').countDocuments();
      console.log(`There are ${itineraryCount} itineraries in the database`);
      
      // List all itineraries
      console.log("\nListing all itineraries:");
      const itineraries = await db.collection('itineraries').find().toArray();
      
      if (itineraries.length === 0) {
        console.log("No itineraries found in the database.");
      } else {
        console.log("\n=== FULL ITINERARY OBJECTS ===");
        itineraries.forEach((itinerary, index) => {
          console.log(`\n--- Itinerary ${index + 1} ---`);
          console.log(JSON.stringify(itinerary, null, 2));
          
          // Print formatted fields for easier reading
          console.log(`\n--- Itinerary ${index + 1} Details ---`);
          console.log(`ID: ${itinerary._id}`);
          console.log(`Title: ${itinerary.title || 'Not set'}`);
          console.log(`Description: ${itinerary.description || 'Not set'}`);
          console.log(`Created By (User ID): ${itinerary.createdBy || 'Not set'}`);
          console.log(`Starting Price: ${itinerary.startingPrice || 'Not set'}`);
          console.log(`Created At: ${itinerary.createdAt || 'Not set'}`);
          
          if (itinerary.status) {
            console.log(`Status: ${itinerary.status}`);
          }
          
          // Additional fields that might be present
          Object.keys(itinerary).forEach(key => {
            if (!['_id', 'title', 'description', 'createdBy', 'startingPrice', 'createdAt', 'status'].includes(key)) {
              console.log(`${key}: ${JSON.stringify(itinerary[key])}`);
            }
          });
        });
      }
      
      // Check for itinerary places collection
      if (collections.find(c => c.name === 'itineraryPlaces')) {
        console.log("\nItinerary Places collection exists");
        
        // Count itinerary places
        const placeCount = await db.collection('itineraryPlaces').countDocuments();
        console.log(`There are ${placeCount} itinerary places in the database`);
        
        // List all itinerary places
        if (placeCount > 0) {
          console.log("\nListing all itinerary places:");
          const places = await db.collection('itineraryPlaces').find().toArray();
          
          places.forEach((place, index) => {
            console.log(`\n--- Itinerary Place ${index + 1} ---`);
            console.log(JSON.stringify(place, null, 2));
          });
          
          // Map itinerary places to their respective itineraries
          console.log("\nMapping itinerary places to itineraries:");
          for (const itinerary of itineraries) {
            const itineraryPlaces = places.filter(place => {
              try {
                return place.itineraryId?.toString() === itinerary._id?.toString();
              } catch (e) {
                console.log(`Error comparing itineraryId: ${e.message}`);
                return false;
              }
            });
            console.log(`\nItinerary "${itinerary.title || 'Untitled'}" (ID: ${itinerary._id}) has ${itineraryPlaces.length} places`);
            
            for (const place of itineraryPlaces) {
              try {
                // Get place details from places collection
                const placeDetails = await db.collection('places').findOne({ _id: place.placeId });
                if (placeDetails) {
                  console.log(`- Place: ${placeDetails.name} (order: ${place.order})`);
                  console.log(`  Details: ${JSON.stringify(placeDetails, null, 2)}`);
                } else {
                  console.log(`- Place: Unknown (ID: ${place.placeId}, order: ${place.order})`);
                }
              } catch (e) {
                console.log(`Error fetching place details: ${e.message}`);
              }
            }
          }
        }
      } else {
        console.log("Itinerary Places collection does not exist yet");
      }
      
      // Check which user created the itineraries
      console.log("\n--- Checking itinerary creators ---");
      for (const itinerary of itineraries) {
        if (itinerary.createdBy) {
          try {
            const user = await db.collection('users').findOne({ _id: itinerary.createdBy });
            if (user) {
              console.log(`Itinerary "${itinerary.title || 'Untitled'}" was created by user:`);
              console.log(`  Username: ${user.username}`);
              console.log(`  Email: ${user.email}`);
              console.log(`  User Type: ${user.userType}`);
              console.log(`  User ID: ${user._id}`);
            } else {
              console.log(`Itinerary "${itinerary.title || 'Untitled'}" creator (ID: ${itinerary.createdBy}) not found in users collection`);
            }
          } catch (e) {
            console.log(`Error looking up itinerary creator: ${e.message}`);
            // If the error is due to createdBy not being an ObjectId, try string comparison
            console.log("Attempting to find user by string ID comparison...");
            const users = await db.collection('users').find().toArray();
            const creator = users.find(user => user._id.toString() === itinerary.createdBy.toString());
            if (creator) {
              console.log(`Found creator by string comparison: ${creator.username} (${creator._id})`);
            } else {
              console.log("Could not find creator by string comparison either");
            }
          }
        } else {
          console.log(`Itinerary "${itinerary.title || 'Untitled'}" has no createdBy field`);
        }
      }
    } else {
      console.log("Itineraries collection does not exist yet");
    }
    
    console.log("\nDone!");
    process.exit(0);
  } catch (error) {
    console.error("Error checking itineraries:", error);
    process.exit(1);
  }
}

// Run the function
checkItineraries(); 