// THIS FILE IS ONLY USED FOR TESTING
// DELETE THIS FILE BEFORE HOSTING
// THIS FILE HAS NO API SECURITY

import { NextResponse } from "next/server";
import { db } from "@/db"; // Ensure this is your database connection
import { productsTable } from "@/db/schema"; // Import your schema
import { v4 as uuidv4 } from "uuid";

// Seller IDs
const sellerIDs = [
    "ZImeah0yfzsVnQN1XNAyu",
    "1ShGngs86ei3RfyqUtgUa",
    "bJt92dRVC0ZCCNPL_WudG",
    "VHxhwGWO5Yasc4ijC8Lb6",
    "g-86K4GXv2_7EuG1M5EFB",
    "pzti9SJfckc9GwVRaLw_4",
];

// Categories with 60 different product names each
const categories = {
    "Electronics": [
        { name: "Laptop", image: "/laptop.jpg", description: "A portable computer designed for convenience, performance, and mobility. Ideal for work, gaming, and entertainment." },
        { name: "Desktop PC", image: "/desktop-pc.jpg", description: "A high-performance computer for home or office use. Suitable for gaming, professional tasks, and general computing." },
        { name: "Gaming Laptop", image: "/gaming-laptop.jpg", description: "A high-end laptop with powerful graphics and processing capabilities, perfect for immersive gaming experiences." },
        { name: "All-in-One PC", image: "/all-in-one-pc.jpg", description: "A space-saving computer with a sleek design, integrating the monitor and CPU into a single unit for convenience." },
        { name: "Computer Monitor", image: "/monitor.jpg", description: "A high-resolution display screen designed for gaming, professional work, and everyday computing needs." },
        { name: "External Hard Drive", image: "/hard-drive.jpg", description: "A portable storage device that allows you to back up important files and expand your digital storage capacity." },
        { name: "SSD", image: "/ssd.jpg", description: "A high-speed solid-state drive that enhances your computer's performance with faster load times and improved durability." },
        { name: "USB Flash Drive", image: "/usb-flash.jpg", description: "A compact and portable storage device that makes transferring files quick and easy." },
        { name: "Mechanical Keyboard", image: "/keyboard.jpg", description: "A durable keyboard with tactile keys designed for gamers and professionals who demand precision typing." },
        { name: "Wireless Mouse", image: "/wireless-mouse.jpg", description: "A sleek and responsive mouse that offers mobility and clutter-free connectivity." },
        { name: "Android Smartphone", image: "/android-smartphone.jpg", description: "A feature-rich smartphone powered by Android, offering seamless connectivity and a variety of apps." },
        { name: "iPhone", image: "/iphone.jpg", description: "Apple's flagship smartphone with advanced features, stunning design, and a powerful ecosystem." },
        { name: "Screen Protector", image: "/screen-protector.jpg", description: "A protective layer that shields your smartphone screen from scratches and accidental drops." },
        { name: "Phone Case", image: "/phone-case.jpg", description: "A stylish and durable case designed to protect your smartphone from everyday wear and tear." },
        { name: "Wireless Charger", image: "/wireless-charger.jpg", description: "A convenient charging pad that allows you to power up your smartphone without cables." },
        { name: "Power Bank", image: "/power-banks.jpg", description: "A portable power source that ensures your devices stay charged on the go." },
        { name: "Bluetooth Earbuds", image: "/bluetooth-earbuds.jpg", description: "Compact and wireless earbuds that deliver high-quality audio and hands-free convenience." },
        { name: "Wired Earphones", image: "/wired-earphones.jpg", description: "Classic earphones with a wired connection for clear and uninterrupted sound quality." },
        { name: "PopSocket", image: "/popsockets.jpg", description: "A handy grip and stand for your smartphone that enhances ease of use and functionality." },
        { name: "Car Phone Holder", image: "/car-phone-holders.jpg", description: "A secure mount for your phone that allows hands-free navigation while driving." },
        { name: "Headphones", image: "/noise-cancelling-headphones.jpg", description: "Premium headphones that eliminate background noise for an immersive audio experience." },
        { name: "Gaming Headset", image: "/gaming-headsets.jpg", description: "High-quality headsets with surround sound and a built-in mic, designed for gamers." },
        { name: "Soundbar", image: "/soundbars.jpg", description: "A sleek and powerful speaker system that enhances your TV's audio experience." },
        { name: "Bluetooth Speaker", image: "/bluetooth-speakers.jpg", description: "Portable speakers that deliver high-quality audio with wireless connectivity." },
        { name: "Home Movie System", image: "/home-movie-systems.jpg", description: "An all-in-one entertainment system for a cinematic experience in your living room." },
        { name: "Vinyl Player", image: "/vinyl-record-players.jpg", description: "A nostalgic turntable that lets you enjoy classic vinyl records with modern technology." },
        { name: "Digital Recorder", image: "/digital-voice-recorders.jpg", description: "A compact recorder for capturing clear audio, ideal for interviews and lectures." },
        { name: "Wireless Microphone", image: "/wireless-microphones.jpg", description: "Cordless microphones that provide freedom and convenience for performances and presentations." },
        { name: "Studio Speakers", image: "/studio-monitor-speakers.jpg", description: "Professional-grade speakers designed for accurate audio reproduction." },
        { name: "Smart Glasses", image: "/smart-glasses.jpg", description: "Futuristic glasses that integrate audio technology for an immersive experience." },
        { name: "PlayStation 5 ", image: "/ps5-console.jpg", description: "Sony's latest gaming console with ultra-fast loading times and stunning graphics." },
        { name: "Xbox Series X ", image: "/xbox-series-x.jpg", description: "Microsoft's most powerful console designed for high-performance gaming." },
        { name: "Nintendo Switch", image: "/nintendo-switch.jpg", description: "A hybrid gaming console that allows for both handheld and docked play." },
        { name: "Gaming Controller", image: "/gaming-controllers.jpg", description: "Ergonomic controllers for precise gaming control on various platforms." },
        { name: "VR Headset", image: "/vr-headsets.jpg", description: "Virtual reality headsets that provide an immersive gaming and entertainment experience." },
        { name: "Gaming Chair", image: "/gaming-chairs.jpg", description: "Ergonomic chairs designed for long gaming sessions with ultimate comfort." },
        { name: "Gaming Mousepad", image: "/gaming-mousepads.jpg", description: "Mousepads with customizable RGB lighting for an enhanced gaming setup." },
        { name: "Capture Card", image: "/capture-cards.jpg", description: "Devices that allow you to record and stream gameplay at high quality." },
        { name: "Joystick", image: "/flight-sim-controllers.jpg", description: "Advanced controllers for a realistic flight simulation experience." },
        { name: "Gaming Graphics Card", image: "/gaming-graphics-cards.jpg", description: "High-performance GPUs that power advanced gaming and video editing." },
        { name: "Smart Doorbell", image: "/smart-doorbells.jpg", description: "Video-enabled doorbells that allow you to monitor your doorstep remotely." },
        { name: "WiFi Security Camera", image: "/wifi-security-cameras.jpg", description: "Smart cameras with motion detection for home security monitoring." },
        { name: "Smart Thermostat", image: "/smart-thermostats.jpg", description: "Energy-efficient thermostats that learn your preferences for optimal temperature control." },
        { name: "Smart Light Bulb", image: "/smart-light-bulbs.jpg", description: "WiFi-enabled bulbs that can be controlled via smartphone or voice commands." },
        { name: "Robot Vacuum Cleaner", image: "/robot-vacuums.jpg", description: "Automated vacuum cleaners that keep your floors spotless with minimal effort." },
        { name: "Smart Lock", image: "/smart-locks.jpg", description: "Keyless entry locks with remote access control for enhanced security." },
        { name: "Smart Plug", image: "/smart-plugs.jpg", description: "Plugs that allow remote control of appliances via a mobile app." },
        { name: "Smoke & CO2 Detector", image: "/smoke-detectors.jpg", description: "Smart detectors that provide real-time alerts for smoke and carbon monoxide." },
        { name: "Smart Home Hub", image: "/smart-home-hubs.jpg", description: "A central hub that connects and controls all your smart home devices." },
        { name: "Wireless Alarm System", image: "/wireless-alarm-systems.jpg", description: "A home security system that detects intrusions and alerts homeowners." }
    ],
    "Fashion": [
        { name: "T-Shirts", image: "/tshirts.jpg", description: "Classic and comfortable T-shirts made from high-quality fabric for everyday wear." },
        { name: "Polo Shirts", image: "/polo-shirts.jpg", description: "Stylish polo shirts with a smart-casual design, perfect for both work and leisure." },
        { name: "Hoodies", image: "/hoodies.jpg", description: "Soft and cozy hoodies that provide warmth and comfort for any occasion." },
        { name: "Sweatshirts", image: "/sweatshirts.jpg", description: "Casual sweatshirts designed for layering and all-day comfort." },
        { name: "Blazers", image: "/blazers.jpg", description: "Elegant blazers that add a sophisticated touch to your formal and semi-formal outfits." },
        { name: "Suits", image: "/suits.jpg", description: "Tailored suits that deliver a sharp and professional look for any formal occasion." },
        { name: "Formal Shirts", image: "/formal-shirts.jpg", description: "Crisp and stylish formal shirts perfect for office wear and special events." },
        { name: "Casual Shirts", image: "/casual-shirts.jpg", description: "Relaxed and comfortable shirts for a laid-back, effortless style." },
        { name: "Crop Tops", image: "/crop-tops.jpg", description: "Trendy crop tops that pair perfectly with high-waisted jeans or skirts." },
        { name: "Tank Tops", image: "/tank-tops.jpg", description: "Breathable and lightweight tank tops, great for workouts or summer wear." },
        { name: "Jeans", image: "/jeans.jpg", description: "Durable and stylish denim jeans that fit a variety of styles and occasions." },
        { name: "Chinos", image: "/chinos.jpg", description: "Versatile chinos that offer a balance between casual and smart dressing." },
        { name: "Cargo Pants", image: "/cargo-pants.jpg", description: "Utility-style cargo pants with multiple pockets for a rugged and trendy look." },
        { name: "Leggings", image: "/leggings.jpg", description: "Stretchable and comfortable leggings designed for everyday wear or workouts." },
        { name: "Joggers", image: "/joggers.jpg", description: "Comfortable joggers with a relaxed fit, ideal for lounging or exercise." },
        { name: "Shorts", image: "/shorts.jpg", description: "Casual and breathable shorts perfect for warm-weather outings." },
        { name: "Skirts", image: "/skirts.jpg", description: "Elegant and trendy skirts that complement a wide range of styles." },
        { name: "Formal Trousers", image: "/formal-trousers.jpg", description: "Sleek and stylish formal trousers that enhance your professional look." },
        { name: "Palazzo Pants", image: "/palazzo-pants.jpg", description: "Flowy and comfortable palazzo pants that add a fashionable touch to your outfit." },
        { name: "Denim Shorts", image: "/denim-shorts.jpg", description: "Trendy and versatile denim shorts suitable for casual summer outfits." },
        { name: "Casual Dresses", image: "/casual-dresses.jpg", description: "Chic and comfortable dresses that are perfect for everyday wear." },
        { name: "Evening Gowns", image: "/evening-gowns.jpg", description: "Stunning and elegant gowns designed for formal occasions and parties." },
        { name: "Cocktail Dresses", image: "/cocktail-dresses.jpg", description: "Stylish cocktail dresses that bring glamour and sophistication to any event." },
        { name: "Kaftans", image: "/kaftans.jpg", description: "Light and flowy kaftans perfect for summer relaxation and beach outings." },
        { name: "Sarees", image: "/sarees.jpg", description: "Traditional and beautifully crafted sarees that enhance grace and elegance." },
        { name: "Kurtas & Kurtis", image: "/kurtas.jpg", description: "Comfortable and stylish kurtas and kurtis suitable for casual or festive occasions." },
        { name: "Anarkali Suits", image: "/anarkali-suits.jpg", description: "Elegant and flowing Anarkali suits perfect for traditional gatherings." },
        { name: "Abayas", image: "/abayas.jpg", description: "Modest and stylish abayas crafted with high-quality fabrics for a graceful look." },
        { name: "Jumpsuits", image: "/jumpsuits.jpg", description: "Trendy and chic jumpsuits that offer both style and comfort." },
        { name: "Maxi Dresses", image: "/maxi-dresses.jpg", description: "Long and flowy maxi dresses that make a statement in any season." },
        { name: "Trainers", image: "/trainers.jpg", description: "Comfortable and stylish trainers perfect for casual wear and workouts." },
        { name: "Loafers", image: "/loafers.jpg", description: "Classic and sophisticated loafers suitable for both casual and formal outfits." },
        { name: "High Heels", image: "/high-heels.jpg", description: "Elegant and fashionable high heels that complete any glamorous look." },
        { name: "Ankle Boots", image: "/ankle-boots.jpg", description: "Trendy ankle boots that add a stylish edge to your outfit." },
        { name: "Sandals", image: "/sandals.jpg", description: "Comfortable and stylish sandals for casual and semi-formal wear." },
        { name: "Flip-Flops", image: "/flip-flops.jpg", description: "Lightweight flip-flops perfect for beach days and relaxed outings." },
        { name: "Running Shoes", image: "/running-shoes.jpg", description: "Performance-oriented running shoes designed for comfort and durability." },
        { name: "Formal Shoes", image: "/formal-shoes.jpg", description: "Sleek and stylish formal shoes for professional and special occasions." },
        { name: "Espadrilles", image: "/espadrilles.jpg", description: "Casual and breathable espadrilles ideal for summer fashion." },
        { name: "Slippers", image: "/slippers.jpg", description: "Soft and cozy slippers designed for comfort at home." },
        { name: "Sunglasses", image: "/sunglasses.jpg", description: "Trendy sunglasses that offer protection and style." },
        { name: "Handbags", image: "/handbags.jpg", description: "Elegant and spacious handbags to carry all your essentials." },
        { name: "Clutches", image: "/clutches.jpg", description: "Compact and stylish clutches for formal and party occasions." },
        { name: "Backpacks", image: "/backpacks.jpg", description: "Durable and spacious backpacks perfect for work, travel, and daily use." },
        { name: "Wallets", image: "/wallets.jpg", description: "Stylish and functional wallets to keep your essentials organized." },
        { name: "Leather Belts", image: "/leather-belts.jpg", description: "Classic leather belts that add sophistication to any outfit." },
        { name: "Hats & Caps", image: "/hats.jpg", description: "Fashionable hats and caps for sun protection and style." },
        { name: "Beanies", image: "/beanies.jpg", description: "Warm and cozy beanies perfect for winter fashion." },
        { name: "Silk Scarves", image: "/scarves.jpg", description: "Elegant silk scarves that add a touch of luxury to your outfit." },
        { name: "Neck-ties", image: "/neck-ties.jpg", description: "Classic neckties that complete any formal attire." },
        { name: "Wristwatches", image: "/watches.jpg", description: "Timeless wristwatches designed for style and precision." },
        { name: "Bracelets", image: "/bracelets.jpg", description: "Elegant bracelets that add charm to any ensemble." },
        { name: "Necklaces", image: "/necklaces.jpg", description: "Stylish necklaces that enhance your look with sophistication." },
        { name: "Rings", image: "/rings.jpg", description: "Beautiful rings crafted with precision and elegance." },
        { name: "Earrings", image: "/earrings.jpg", description: "Fashionable earrings that complement any outfit." },
        { name: "Brooches", image: "/brooches.jpg", description: "Elegant brooches that add a touch of sophistication." },
        { name: "Cufflinks", image: "/cufflinks.jpg", description: "Refined cufflinks perfect for formal occasions." }
    ],
    "Home": [
        { name: "Sofas", image: "/sofas.jpg", description: "Comfortable and stylish seating options, available in various designs to complement any living room." },
        { name: "Recliners", image: "/recliners.jpg", description: "Relaxing chairs with adjustable backrests and footrests for ultimate comfort." },
        { name: "Coffee Tables", image: "/coffee-tables.jpg", description: "Elegant and functional tables designed to enhance your living space." },
        { name: "Dining Tables", image: "/dining-tables.jpg", description: "Sturdy and stylish tables perfect for family meals and gatherings." },
        { name: "Office Chairs", image: "/office-chairs.jpg", description: "Ergonomic chairs designed for comfort and productivity in the workplace or home office." },
        { name: "Bookshelves", image: "/bookshelves.jpg", description: "Durable and spacious shelves to store and display books, décor, and more." },
        { name: "Bed Frames", image: "/bed-frames.jpg", description: "Sturdy and stylish bed supports available in multiple sizes and designs." },
        { name: "Night Stands", image: "/night-stands.jpg", description: "Compact bedside tables for convenient storage of essentials." },
        { name: "Wardrobes", image: "/wardrobes.jpg", description: "Spacious storage solutions for organizing clothes and accessories." },
        { name: "TV Stands", image: "/tv-stands.jpg", description: "Stylish and functional units for holding televisions and media devices." },
        { name: "Wall Art & Paintings", image: "/wall-art.jpg", description: "Beautiful decorative pieces that enhance the aesthetic appeal of your home." },
        { name: "Decorative Mirrors", image: "/decorative-mirrors.jpg", description: "Elegant mirrors that add depth and style to any room." },
        { name: "Table Lamps", image: "/table-lamps.jpg", description: "Compact and stylish lamps for desks, bedside tables, and workspaces." },
        { name: "Floor Lamps", image: "/floor-lamps.jpg", description: "Tall and elegant lighting solutions to brighten up your living space." },
        { name: "Vases & Flower Pots", image: "/vases-flower-pots.jpg", description: "Beautiful decorative pieces for displaying fresh or artificial flowers." },
        { name: "Candle Holders", image: "/candles-holders.jpg", description: "Elegant home accessories that create a warm and cozy atmosphere." },
        { name: "Artificial Plants", image: "/artificial-plants.jpg", description: "Lifelike greenery that adds charm to any space without maintenance." },
        { name: "Photo Frames", image: "/photo-frames.jpg", description: "Stylish frames to showcase your cherished memories and artwork." },
        { name: "Wall Clocks", image: "/wall-clocks.jpg", description: "Functional and decorative clocks that enhance the look of your walls." },
        { name: "Rugs & Carpets", image: "/rugs-carpets.jpg", description: "Soft and stylish floor coverings available in various sizes and patterns." },
        { name: "Duvet Covers", image: "/duvet-covers.jpg", description: "Soft and breathable covers to protect and enhance your bedding." },
        { name: "Pillowcases", image: "/pillowcases.jpg", description: "Comfortable and stylish pillow covers available in multiple designs." },
        { name: "Weighted Blankets", image: "/weighted-blankets.jpg", description: "Therapeutic blankets designed to provide relaxation and better sleep." },
        { name: "Mattress Protectors", image: "/mattress-protectors.jpg", description: "Waterproof and breathable covers that safeguard your mattress." },
        { name: "Bath Towels", image: "/bath-towels.jpg", description: "Soft and absorbent towels available in different sizes and materials." },
        { name: "Hand Towels", image: "/hand-towels.jpg", description: "Compact and absorbent towels ideal for bathrooms and kitchens." },
        { name: "Bathrobes", image: "/bathrobes.jpg", description: "Plush and cozy robes perfect for relaxation after a shower or bath." },
        { name: "Bathroom Mats", image: "/bathroom-mats.jpg", description: "Non-slip and absorbent mats to keep your bathroom floors dry." },
        { name: "Shower Curtains", image: "/shower-curtains.jpg", description: "Water-resistant curtains available in stylish designs to enhance bathrooms." },
        { name: "Bath Sponges & Loofahs", image: "/bath-sponges.jpg", description: "Exfoliating sponges and loofahs for a refreshing shower experience." },
        { name: "Dinnerware Sets", image: "/dinnerware-sets.jpg", description: "Complete sets of plates, bowls, and cutlery for elegant dining experiences." },
        { name: "Cutlery Sets", image: "/cutlery-sets.jpg", description: "High-quality forks, knives, and spoons for everyday and special occasions." },
        { name: "Non-Stick Cookware", image: "/non-stick-cookware.jpg", description: "Durable and easy-to-clean pots and pans for hassle-free cooking." },
        { name: "Cast Iron Pans", image: "/cast-iron-pans.jpg", description: "Heavy-duty cookware that retains heat for superior cooking results." },
        { name: "Electric Kettles", image: "/electric-kettles.jpg", description: "Fast-boiling kettles for quick and convenient hot beverages." },
        { name: "Coffee Makers", image: "/coffee-makers.jpg", description: "Efficient machines that brew delicious coffee with ease." },
        { name: "Dish Racks", image: "/dish-racks.jpg", description: "Space-saving drying racks for efficient dish organization." },
        { name: "Spice Organizers", image: "/spice-organizers.jpg", description: "Compact storage solutions for neatly arranging kitchen spices." },
        { name: "Food Storage Containers", image: "/food-storage-containers.jpg", description: "Airtight containers for keeping food fresh and organized." },
        { name: "Kitchen Aprons", image: "/kitchen-aprons.jpg", description: "Protective aprons for keeping clothes clean while cooking." },
        { name: "Storage Baskets", image: "/storage-baskets.jpg", description: "Versatile baskets for organizing household essentials." },
        { name: "Plastic Containers", image: "/plastic-containers.jpg", description: "Durable and reusable containers for storage and food preservation." },
        { name: "Shoe Racks", image: "/shoe-racks.jpg", description: "Compact and efficient racks for organizing shoes neatly." },
        { name: "Laundry Hampers", image: "/laundry-hampers.jpg", description: "Stylish and functional hampers for sorting and storing laundry." },
        { name: "Closet Organizers", image: "/closet-organizers.jpg", description: "Space-saving solutions for arranging clothes and accessories." },
        { name: "Under-Bed Storage Boxes", image: "/under-bed-storage.jpg", description: "Convenient storage containers that maximize under-bed space." },
        { name: "Wall-Mounted Shelves", image: "/wall-mounted-shelves.jpg", description: "Stylish shelves for displaying books, decorations, and essentials." },
        { name: "Makeup Organizers", image: "/makeup-organizers.jpg", description: "Compact storage solutions for keeping cosmetics neatly arranged." },
        { name: "Jewellery Boxes", image: "/jewellery-boxes.jpg", description: "Elegant boxes for storing and protecting valuable jewelry." },
        { name: "Drawer Dividers", image: "/drawer-dividers.jpg", description: "Customizable dividers for organizing drawers efficiently." },
        { name: "Air Purifiers", image: "/air-purifiers.jpg", description: "Advanced purifiers that improve indoor air quality and remove allergens." },
        { name: "Humidifiers", image: "/humidifiers.jpg", description: "Devices that maintain humidity levels for a comfortable living space." },
        { name: "Essential Oil Diffusers", image: "/oil-diffusers.jpg", description: "Aromatherapy devices that spread pleasant scents for relaxation." },
        { name: "Smart Home Assistants", image: "/smart-home-assistants.jpg", description: "Voice-controlled devices that help manage smart home systems." },
        { name: "Security Cameras", image: "/security-cameras.jpg", description: "High-resolution cameras for enhanced home surveillance." },
        { name: "Doorbell Cameras", image: "/doorbell-cameras.jpg", description: "Smart doorbells with video recording and real-time alerts." },
        { name: "Electric Fans", image: "/electric-fans.jpg", description: "Powerful and energy-efficient fans for cooling your home." },
        { name: "Space Heaters", image: "/space-heaters.jpg", description: "Compact heaters for keeping rooms warm during cold seasons." },
        { name: "Dehumidifiers", image: "/dehumidifiers.jpg", description: "Devices that reduce excess moisture for better air quality." },
        { name: "Extension Cords", image: "/power-strips.jpg", description: "Multi-outlet power solutions for connecting multiple devices safely." }
    ]
};


// Function to generate a random integer
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;

export async function GET() {
    try {
        const productsToInsert = [];

        // Loop through each category
        for (const [category, productList] of Object.entries(categories)) {
            for (let i = 0; i < 60; i++) {
                // Randomly select a product from the list
                const productData = productList[i];

                if (!productData) continue;

                // Create a new product entry
                const product = {
                    productID: uuidv4(), // Unique product ID
                    name: productData.name, // Product name
                    description: productData.description, // Product description
                    image: productData.image, // Product image
                    avgRating: `${getRandomInt(1, 10)}`, // Initial rating
                    sellerID: sellerIDs[getRandomInt(0, sellerIDs.length - 1)], // Random seller
                    stock: 50, // Default stock
                    category: category, // Assigned category
                    price: `${getRandomInt(5, 100)}`, // Random price
                };

                productsToInsert.push(product);
            }
        }


        // Insert products into the database
        await db.insert(productsTable).values(productsToInsert);

        return NextResponse.json({ message: "Products populated successfully!" }, { status: 201 });
    } catch (error) {
        console.error("Error populating products:", error);
        return NextResponse.json({ error: "Failed to populate products" }, { status: 500 });
    }
}