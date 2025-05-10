import { Place } from '../../shared/schema';

export const maharashtraAttractions: Omit<Place, 'id' | 'createdAt' | 'updatedAt'>[] = [
  // Mumbai
  {
    name: 'Gateway of India',
    description: 'An arch monument built in the early twentieth century in Mumbai, the Gateway of India is one of the most popular tourist destinations in the city.',
    location: 'Mumbai',
    category: 'monument',
    latitude: '18.9220',
    longitude: '72.8347',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/3/3a/Mumbai_03-2016_30_Gateway_of_India.jpg',
    rating: 4.5,
    reviews: [],
    openingHours: '24/7',
    entryFee: 'Free',
    bestTimeToVisit: 'Early morning or evening'
  },
  {
    name: 'Marine Drive',
    description: 'A 3.6-kilometer-long boulevard in Mumbai that offers stunning views of the Arabian Sea.',
    location: 'Mumbai',
    category: 'landmark',
    latitude: '18.9442',
    longitude: '72.8237',
    imageUrl: 'https://images.unsplash.com/photo-1570168007204-dfb528c6958f'
  },
  {
    name: 'Elephanta Caves',
    description: 'Ancient cave temples dedicated to Lord Shiva, located on Elephanta Island in Mumbai Harbor.',
    location: 'Mumbai',
    category: 'heritage',
    latitude: '18.9633',
    longitude: '72.9315',
    imageUrl: 'https://images.unsplash.com/photo-1590517846861-a37509e3536a'
  },
  {
    name: 'Chhatrapati Shivaji Terminus',
    description: 'A UNESCO World Heritage Site and historic railway station in Mumbai with Victorian Gothic architecture.',
    location: 'Mumbai',
    category: 'heritage',
    latitude: '18.9398',
    longitude: '72.8355',
    imageUrl: 'https://images.unsplash.com/photo-1529253355930-ddbe423a2ac7'
  },
  {
    name: 'Siddhivinayak Temple',
    description: 'The Shree Siddhivinayak Ganapati Mandir is a Hindu temple dedicated to Lord Shri Ganesh. It was originally built by Laxman Vithu and Deubai Patil on November 19, 1801. It is one of the richest temples in Mumbai.',
    location: 'Mumbai',
    category: 'temple',
    latitude: '19.0170',
    longitude: '72.8302',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/23/Siddhivinayak_Temple.jpg/1280px-Siddhivinayak_Temple.jpg'
  },
  {
    name: 'Juhu Beach',
    description: 'Popular beach in Mumbai known for its street food and entertainment options.',
    location: 'Mumbai',
    category: 'beach',
    latitude: '19.0948',
    longitude: '72.8258',
    imageUrl: 'https://images.unsplash.com/photo-1585116938581-f64c55ecd3cc'
  },
  {
    name: 'Haji Ali Dargah',
    description: 'A famous mosque and dargah located on an islet off the coast of Worli in Mumbai.',
    location: 'Mumbai',
    category: 'monument',
    latitude: '18.9826',
    longitude: '72.8090',
    imageUrl: 'https://images.unsplash.com/photo-1590666065450-5a500d305476'
  },
  {
    name: 'Sanjay Gandhi National Park',
    description: 'A large protected forest area in Mumbai with rich biodiversity and ancient Kanheri Caves.',
    location: 'Mumbai',
    category: 'nature',
    latitude: '19.2147',
    longitude: '72.9106',
    imageUrl: 'https://images.unsplash.com/photo-1609515793406-2543d261d061'
  },
  
  // Pune
  {
    name: 'Aga Khan Palace',
    description: 'A majestic building in Pune, significant for its historical importance during India\'s independence movement.',
    location: 'Pune',
    category: 'heritage',
    latitude: '18.5476',
    longitude: '73.9009',
    imageUrl: 'https://images.unsplash.com/photo-1589308824542-76baba7e813f'
  },
  {
    name: 'Shaniwar Wada',
    description: 'A historical fortification in Pune that was once the seat of the Peshwa rulers of the Maratha Empire.',
    location: 'Pune',
    category: 'heritage',
    latitude: '18.5195',
    longitude: '73.8554',
    imageUrl: 'https://images.unsplash.com/photo-1623164938411-08c04aa33564'
  },
  {
    name: 'Dagadusheth Halwai Ganapati Temple',
    description: 'A popular temple dedicated to the Hindu god Ganesh in Pune.',
    location: 'Pune',
    category: 'temple',
    latitude: '18.5167',
    longitude: '73.8562',
    imageUrl: 'https://images.unsplash.com/photo-1611672585731-fa10603aa9e0'
  },
  {
    name: 'Osho Ashram',
    description: 'A spiritual center in Pune founded by Rajneesh (Osho) attracting visitors from around the world.',
    location: 'Pune',
    category: 'spiritual',
    latitude: '18.5430',
    longitude: '73.8968',
    imageUrl: 'https://images.unsplash.com/photo-1604014809285-7e3b6f4b9c81'
  },
  {
    name: 'Sinhagad Fort',
    description: 'A historical fortress located at about 30 km from Pune with a significant role in Maratha history.',
    location: 'Pune',
    category: 'heritage',
    latitude: '18.3663',
    longitude: '73.7546',
    imageUrl: 'https://images.unsplash.com/photo-1628164362791-9f60a9fc3387'
  },
  {
    name: 'Pataleshwar Cave Temple',
    description: 'An 8th-century rock-cut temple carved out of a single rock in Pune.',
    location: 'Pune',
    category: 'temple',
    latitude: '18.5193',
    longitude: '73.8498',
    imageUrl: 'https://images.unsplash.com/photo-1623162419493-03f5e7f8c5b7'
  },
  
  // Aurangabad
  {
    name: 'Ajanta Caves',
    description: 'The Ajanta Caves are ancient Buddhist rock-cut cave monuments dating from the 2nd century BCE to about 480 CE in Aurangabad district of Maharashtra.',
    location: 'Aurangabad',
    category: 'heritage',
    latitude: '20.5519',
    longitude: '75.7033',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c3/Ajanta_caves_Maharashtra.jpg',
    rating: 4.8,
    reviews: [],
    openingHours: '9 AM - 5:30 PM',
    entryFee: 'INR 40 for Indians, INR 600 for foreigners',
    bestTimeToVisit: 'November to March'
  },
  {
    name: 'Ellora Caves',
    description: 'The Ellora Caves are a UNESCO World Heritage Site located in the Aurangabad district of Maharashtra. The caves are known for their Hindu, Buddhist, and Jain temples carved out of rock.',
    location: 'Aurangabad',
    category: 'heritage',
    latitude: '20.0258',
    longitude: '75.1780',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/8/8c/Kailasa_temple_at_ellora.jpg',
    rating: 4.7,
    reviews: [],
    openingHours: '6 AM - 6 PM',
    entryFee: 'INR 40 for Indians, INR 600 for foreigners',
    bestTimeToVisit: 'November to March'
  },
  {
    name: 'Bibi Ka Maqbara',
    description: 'A beautiful mausoleum similar to the Taj Mahal, built by Aurangzeb\'s son in memory of his mother.',
    location: 'Aurangabad',
    category: 'monument',
    latitude: '19.9012',
    longitude: '75.3203',
    imageUrl: 'https://images.unsplash.com/photo-1614089354455-9a0b6bfe94f2'
  },
  {
    name: 'Daulatabad Fort',
    description: 'A 14th-century fortress located about 16 km from Aurangabad known for its intricate defense systems.',
    location: 'Aurangabad',
    category: 'heritage',
    latitude: '19.9432',
    longitude: '75.2110',
    imageUrl: 'https://images.unsplash.com/photo-1621317912125-3e0ec9d4c01a'
  },
  
  // Lonavala
  {
    name: 'Bhushi Dam',
    description: 'A small dam in Lonavala where visitors enjoy the cascading waters during the monsoon season.',
    location: 'Lonavala',
    category: 'nature',
    latitude: '18.7546',
    longitude: '73.4001',
    imageUrl: 'https://images.unsplash.com/photo-1599119315486-10579f1d4d2e'
  },
  {
    name: 'Karla Caves',
    description: 'Ancient Buddhist rock-cut caves dating back to the 2nd century BCE near Lonavala.',
    location: 'Lonavala',
    category: 'heritage',
    latitude: '18.7852',
    longitude: '73.4601',
    imageUrl: 'https://images.unsplash.com/photo-1626265152673-cbe9b0b5bc31'
  },
  {
    name: 'Tiger\'s Leap',
    description: 'A cliff-top viewpoint with panoramic views of the surrounding valley in Lonavala.',
    location: 'Lonavala',
    category: 'nature',
    latitude: '18.7527',
    longitude: '73.3740',
    imageUrl: 'https://images.unsplash.com/photo-1564254552-7defac7f6465'
  },
  {
    name: 'Rajmachi Fort',
    description: 'A historic fort consisting of two fortified peaks near Lonavala, a popular trekking destination.',
    location: 'Lonavala',
    category: 'heritage',
    latitude: '18.8240',
    longitude: '73.3986',
    imageUrl: 'https://images.unsplash.com/photo-1621318844927-a796d6fa7bba'
  },
  {
    name: 'Lonavala Lake',
    description: 'Lonavala Lake is a popular tourist destination offering scenic views and boating activities. The lake is surrounded by natural beauty and is particularly stunning during the monsoon season.',
    location: 'Lonavala',
    category: 'nature',
    latitude: '18.7520',
    longitude: '73.4072',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1c/Lonavala_Lake.jpg/1280px-Lonavala_Lake.jpg'
  },
  
  // Nashik
  {
    name: 'Trimbakeshwar Temple',
    description: 'One of the twelve Jyotirlingas dedicated to Lord Shiva, located in Nashik.',
    location: 'Nashik',
    category: 'temple',
    latitude: '19.9322',
    longitude: '73.5281',
    imageUrl: 'https://images.unsplash.com/photo-1620909293596-de0bfbc57635'
  },
  {
    name: 'Sula Vineyards',
    description: 'Sula Vineyards is India\'s largest wine producer and a pioneer of wine tourism in the country. The winery offers tours, tastings, and a resort experience in the heart of Nashik\'s wine country.',
    location: 'Nashik',
    category: 'winery',
    latitude: '20.0123',
    longitude: '73.7957',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5c/Sula_Vineyards%2C_Nashik.jpg/1280px-Sula_Vineyards%2C_Nashik.jpg'
  },
  {
    name: 'Pandavleni Caves',
    description: 'A group of 24 Hinayana Buddhist caves dating back to 1st century BCE in Nashik.',
    location: 'Nashik',
    category: 'heritage',
    latitude: '19.9798',
    longitude: '73.7812',
    imageUrl: 'https://images.unsplash.com/photo-1614843079796-4ee6353fc8c9'
  },
  {
    name: 'Kalaram Temple',
    description: 'An ancient Hindu temple dedicated to Lord Rama in Nashik with historical significance.',
    location: 'Nashik',
    category: 'temple',
    latitude: '20.0060',
    longitude: '73.7789',
    imageUrl: 'https://images.unsplash.com/photo-1589308809455-7d8e8d129b5c'
  },
  
  // Kolhapur
  {
    name: 'Mahalakshmi Temple',
    description: 'The Mahalakshmi Temple is one of the Shakti Peethas. It is located in Kolhapur, Maharashtra, India. The temple is dedicated to Amba Bai (Mother Goddess). The temple belongs architecturally to the Kannada Chalukya empire.',
    location: 'Kolhapur',
    category: 'temple',
    latitude: '16.7047',
    longitude: '74.2435',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/1/1b/Mahalakshmi_Temple_Kolhapur.jpg/1280px-Mahalakshmi_Temple_Kolhapur.jpg'
  },
  {
    name: 'New Palace Museum',
    description: 'A majestic palace turned museum in Kolhapur displaying the royal heritage of the Kolhapur state.',
    location: 'Kolhapur',
    category: 'heritage',
    latitude: '16.7033',
    longitude: '74.2353',
    imageUrl: 'https://images.unsplash.com/photo-1621318923773-effce526c9ec'
  },
  {
    name: 'Rankala Lake',
    description: 'A popular lake in Kolhapur with recreational facilities and a beautiful garden.',
    location: 'Kolhapur',
    category: 'nature',
    latitude: '16.6964',
    longitude: '74.2177',
    imageUrl: 'https://images.unsplash.com/photo-1580054593188-33dffe21e153'
  },
  
  // Mahabaleshwar
  {
    name: 'Venna Lake',
    description: 'A popular boating lake in Mahabaleshwar with scenic surroundings.',
    location: 'Mahabaleshwar',
    category: 'nature',
    latitude: '17.9246',
    longitude: '73.6419',
    imageUrl: 'https://images.unsplash.com/photo-1626265128840-37157311e642'
  },
  {
    name: 'Arthur\'s Seat Point',
    description: 'A scenic viewpoint in Mahabaleshwar offering panoramic views of the Sahyadri mountain range.',
    location: 'Mahabaleshwar',
    category: 'nature',
    latitude: '17.9611',
    longitude: '73.6464',
    imageUrl: 'https://images.unsplash.com/photo-1599407374964-525e3f3ed3b6'
  },
  {
    name: 'Pratapgad Fort',
    description: 'Pratapgad is a large fort located in Satara district, Maharashtra. It is now a popular tourist destination and is maintained by Uran Islampur Municipality. The fort\'s upper campus includes a temple to the deity Bhavani.',
    location: 'Satara',
    category: 'heritage',
    latitude: '17.9367',
    longitude: '73.5801',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/9/9a/Pratapgad_Fort.jpg/1280px-Pratapgad_Fort.jpg'
  },
  {
    name: 'Mahabaleshwar Temple',
    description: 'The Mahabaleshwar Temple is an ancient shrine and an example of the Maratha heritage, featuring traditional architecture. The temple is a significant pilgrimage site dedicated to Lord Shiva.',
    location: 'Mahabaleshwar',
    category: 'temple',
    latitude: '17.9257',
    longitude: '73.6559',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/5/5f/Mahabaleshwar_Temple.jpg/1280px-Mahabaleshwar_Temple.jpg'
  },
  
  // Nagpur
  {
    name: 'Zero Mile Stone',
    description: 'A historical monument in Nagpur marking the geographical center of colonial India.',
    location: 'Nagpur',
    category: 'monument',
    latitude: '21.1484',
    longitude: '79.0865',
    imageUrl: 'https://images.unsplash.com/photo-1618828542692-d474dd84a3b4'
  },
  {
    name: 'Ramtek Fort Temple',
    description: 'A temple fort complex in Nagpur associated with Lord Rama with historical and mythological significance.',
    location: 'Nagpur',
    category: 'temple',
    latitude: '21.3952',
    longitude: '79.3324',
    imageUrl: 'https://images.unsplash.com/photo-1624088088711-d59df0c9a3e2'
  },
  {
    name: 'Futala Lake',
    description: 'A beautiful lake in Nagpur with musical fountains and lighting in the evenings.',
    location: 'Nagpur',
    category: 'nature',
    latitude: '21.1563',
    longitude: '79.0474',
    imageUrl: 'https://images.unsplash.com/photo-1599407445683-8737b8f03e33'
  },
  
  // Shirdi
  {
    name: 'Sai Baba Temple',
    description: 'A famous temple dedicated to Sai Baba, a spiritual leader highly revered across India.',
    location: 'Shirdi',
    category: 'temple',
    latitude: '19.7645',
    longitude: '74.4762',
    imageUrl: 'https://images.unsplash.com/photo-1614843349445-ee0aa22fa921'
  },
  {
    name: 'Dwarkamai Mosque',
    description: 'A historic mosque in Shirdi where Sai Baba lived and taught his disciples.',
    location: 'Shirdi',
    category: 'monument',
    latitude: '19.7648',
    longitude: '74.4763',
    imageUrl: 'https://images.unsplash.com/photo-1569310404574-5ae116c31525'
  },
  
  // Alibag
  {
    name: 'Alibag Beach',
    description: 'A popular beach town near Mumbai with a clean shoreline and Kolaba Fort nearby.',
    location: 'Alibag',
    category: 'beach',
    latitude: '18.6418',
    longitude: '72.8719',
    imageUrl: 'https://images.unsplash.com/photo-1628164410209-4ea14ebe1d45'
  },
  {
    name: 'Kolaba Fort',
    description: 'A sea fort in Alibag built by Chhatrapati Shivaji Maharaj that can be accessed during low tide.',
    location: 'Alibag',
    category: 'heritage',
    latitude: '18.6465',
    longitude: '72.8684',
    imageUrl: 'https://images.unsplash.com/photo-1618489182093-49788080a115'
  },
  
  // Matheran
  {
    name: 'Charlotte Lake',
    description: 'A serene lake in Matheran surrounded by lush greenery, a popular spot for picnics.',
    location: 'Matheran',
    category: 'nature',
    latitude: '18.9884',
    longitude: '73.2627',
    imageUrl: 'https://images.unsplash.com/photo-1564254540685-989b197242d3'
  },
  {
    name: 'Echo Point',
    description: 'A viewpoint in Matheran known for its echo effect and spectacular valley views.',
    location: 'Matheran',
    category: 'nature',
    latitude: '18.9913',
    longitude: '73.2789',
    imageUrl: 'https://images.unsplash.com/photo-1576929793529-213da405fffe'
  },
  {
    name: 'One Tree Hill Point',
    description: 'A popular viewpoint in Matheran with a single tree at its summit, offering panoramic views.',
    location: 'Matheran',
    category: 'nature',
    latitude: '18.9796',
    longitude: '73.2768',
    imageUrl: 'https://images.unsplash.com/photo-1586349296122-d6bb6e7e575c'
  },
  
  // Khandala
  {
    name: 'Duke\'s Nose',
    description: 'A cliff resembling a nose shape offering stunning views of the Sahyadri range in Khandala.',
    location: 'Khandala',
    category: 'nature',
    latitude: '18.7583',
    longitude: '73.3762',
    imageUrl: 'https://images.unsplash.com/photo-1586402504827-34ecda4afbc9'
  },
  {
    name: 'Kune Falls',
    description: 'A beautiful three-tiered waterfall near Khandala, particularly impressive during the monsoon season.',
    location: 'Khandala',
    category: 'nature',
    latitude: '18.7644',
    longitude: '73.3822',
    imageUrl: 'https://images.unsplash.com/photo-1581237878689-635fac97ae3d'
  },
  
  // Panchgani
  {
    name: 'Table Land',
    description: 'A vast volcanic plateau in Panchgani, the second-longest mountain plateau in Asia.',
    location: 'Panchgani',
    category: 'nature',
    latitude: '17.9290',
    longitude: '73.8087',
    imageUrl: 'https://images.unsplash.com/photo-1548282531-1a9ca0ab5a42'
  },
  {
    name: 'Parsi Point',
    description: 'A viewpoint in Panchgani offering breathtaking views of the Krishna Valley and the Dhom Dam.',
    location: 'Panchgani',
    category: 'nature',
    latitude: '17.9207',
    longitude: '73.8103',
    imageUrl: 'https://images.unsplash.com/photo-1581087767855-af055e9312f6'
  },
  
  // Bhandardara
  {
    name: 'Arthur Lake',
    description: 'A beautiful lake in Bhandardara created by the Wilson Dam offering boating facilities.',
    location: 'Bhandardara',
    category: 'nature',
    latitude: '19.5422',
    longitude: '73.7531',
    imageUrl: 'https://images.unsplash.com/photo-1586402500337-38963e8de548'
  },
  {
    name: 'Randha Falls',
    description: 'A spectacular waterfall in Bhandardara where the Pravara River plunges from a height of 170 feet.',
    location: 'Bhandardara',
    category: 'nature',
    latitude: '19.5611',
    longitude: '73.7442',
    imageUrl: 'https://images.unsplash.com/photo-1581087848048-9911facb142c'
  },
  
  // Ratnagiri
  {
    name: 'Ganpatipule Beach',
    description: 'A pristine beach in Ratnagiri known for its clean golden sands and a famous Ganesh temple.',
    location: 'Ratnagiri',
    category: 'beach',
    latitude: '17.1459',
    longitude: '73.2695',
    imageUrl: 'https://images.unsplash.com/photo-1551516044-6f6b33d0c3e1'
  },
  {
    name: 'Thibaw Palace',
    description: 'A historical palace in Ratnagiri where the last king of Burma was exiled by the British.',
    location: 'Ratnagiri',
    category: 'heritage',
    latitude: '16.9902',
    longitude: '73.3120',
    imageUrl: 'https://images.unsplash.com/photo-1568475064736-29d7dbc96bb5'
  },
  {
    name: 'Kolhapur Palace',
    description: 'The New Palace or the Maharaja\'s Palace is a palace situated in Kolhapur, in the Indian state of Maharashtra. It was constructed between 1877 and 1884 during the reign of Chhatrapati Shahu Maharaj.',
    location: 'Kolhapur',
    category: 'heritage',
    latitude: '16.7050',
    longitude: '74.2433',
    imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/thumb/2/2d/New_Palace_Kolhapur.jpg/1280px-New_Palace_Kolhapur.jpg'
  }
];