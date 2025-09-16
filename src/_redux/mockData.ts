import { generateUUID } from "@/_utils";
import { Product } from "@/types";

export const mockProducts: Product[] = [
	{
		id: generateUUID(),
		name: "Brain Super Food",
		price: 35000,
		originalPrice: 40000,
		// image: "https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?w=400&h=400&fit=crop",
		image: "/images/BrainSuper.png",
		category: "Fruits",
		description:
			"Executive and Cognitive Function | Manage Memory Loss | Mental Wellness",
		inStock: true,
		organic: true,
		rating: 4.8,
		reviews: 124,
	},
	{
		id: generateUUID(),
		name: "Gut Brain Superfood",
		price: 30000,
		originalPrice: 35000,
		// image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&h=400&fit=crop",
		image: "/images/GUTBrainSuperfood.png",
		category: "Vegetables",
		description:
			"Improves Gut health | It supports good sleep | Increases organic probiotics | Mental Wellness",
		inStock: true,
		organic: true,
		rating: 3.6,
		reviews: 89,
	},
	{
		id: generateUUID(),
		name: "Exotic green smoothie",
		price: 20000,
		originalPrice: 25000,
		// image: "https://images.unsplash.com/photo-1498557850523-fd3d118b962e?w=400&h=400&fit=crop",
		image: "/images/smoothie-removebg.png",
		category: "Fruits",
		description:
			"Immune Booster | Heart, Liver and Kidney Health | Enhance Digestion",
		inStock: true,
		organic: true,
		rating: 3.9,
		reviews: 156,
	},
	{
		id: generateUUID(),
		name: "Ultimate Organic Aphrodisiac (For Men)",
		price: 20000,
		originalPrice: 24000,
		// image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&h=400&fit=crop",
		image: "/images/capsule-removebg.png",
		category: "Grains",
		description:
			"Libido Enhancer, Increased Testosterone, Stress Management, For Erectile Dysfunction, Improved Sperm Quality",
		inStock: true,
		organic: true,
		rating: 2.7,
		reviews: 203,
	},
	{
		id: generateUUID(),
		name: "Goron Tula - Fruit & Powder (For Women)",
		price: 10000,
		originalPrice: 12500,
		// image: "https://images.unsplash.com/photo-1582515073490-39981397c445?w=400&h=400&fit=crop",
		image: "/images/gorontula-removebg.png",
		category: "Vegetables",
		description: "Enhances reproductive health and boosts immunity naturally",
		inStock: true,
		organic: true,
		rating: 2.5,
		reviews: 78,
	},
	{
		id: generateUUID(),
		name: "Purple Super Food",
		price: 24000,
		originalPrice: 30000,
		// image: "https://images.unsplash.com/photo-1571115764595-644a1f56a55c?w=400&h=400&fit=crop",
		image: "/images/purple-super-food-preview.png",
		category: "Pantry",
		description:
			"Prevents/Fights Cancer | Reduce Heart Disease Risk | Boost Brain Health | Packed with Antioxidant | Radiant Skin | Pre/Post Workout + Many More",
		inStock: true,
		organic: true,
		rating: 2.8,
		reviews: 145,
	},
	{
		id: generateUUID(),
		name: "Dates Powder",
		price: 4500,
		// originalPrice: 25000,
		// image: "https://unsplash.com/photos/a-pile-of-broccoli-sitting-on-top-of-a-white-table-t6DpKVQdLYQ?w=400&h=400&fit=crop",
		image: "/images/dates-powder-preview.png",
		category: "Vegetables",
		description:
			"Promotes Healthy Pregnancy | Supports Eye Health | Boosts Energy | Aids Digestion | Supports Heart Health | Strengthens Bones | Improves Brain Function | Regulates Blood Sugar",
		inStock: true,
		organic: true,
		rating: 5,
		reviews: 92,
	},
	{
		id: generateUUID(),
		name: "Tigernuts Powder",
		price: 4000,
		// originalPrice: 25000,
		// image: "https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=400&fit=crop",
		image: "/images/tigernuts-powder-preview.png",
		category: "Fruits",
		description:
			"Promotes Healthy Skin | Rich in Fiber | Boosts Energy | Supports Heart Health | Regulates Blood Sugar | Good for Weight Management | Dairy-Free & Nut-Free",
		inStock: false,
		organic: true,
		rating: 5,
		reviews: 167,
	},
];

const productDetails = [
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-1",
		title: "Brain Super Food",
		slug: "brain_super_food",
		link: `https://greenpastures.vercel.app#brain_super_food`,
		summary:
			"Executive and Cognitive Function | Manage Memory Loss | Mental Wellness",
		price: 35000,
		old_price: 40000,
		discount: 0,
		qty: 37,
		tags: [],
		image_url: ["./images/BrainSuper.png", "./images/capsule-removebg.png"],
		carousel_image_url: "./images/deskstopheader.jpg",
		ingredient: {},
		directions: ``,
		description: `
         Brain Super Food is a powdered dietary supplement crafted from a nutrient-rich blend of vegetables.<br/> These ingredients are dried under controlled conditions to preserve essential vitamins, minerals, and antioxidants vital for overall body health.

         This supplement is designed to enhance cognitive and executive function of the brain. <br/> Simply mix it with water or your favorite smoothie for a natural health boost.
         <br/><br/>
         <p><strong>Key benefits include:</strong></p>
         <ul>
            <li>Supports executive and cognitive function</li>
            <li>Support Brain Health</li>
            <li>Reduce Brain Imflammation</li>
            <li>Reduces Sensory load and brain fogs </li>
            <li>Enhances the production of dopamine and other brain hormones</li>
            <li>Improve neurotransmission function in the CNS</li>
            <li>Good for Autistic and ADHD Individual </li>
            <li><strong>💯% natural:</strong></li>
         </ul>
         <br />
         For best results <br/> <strong>Adult</strong>1 Tablespoon in the evening before bed time<br/> <strong>Children</strong>1 Teaspoon in the evening before bed time<br/>`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-2",
		title: "Gut Brain Superfood",
		slug: "gut_brain_superfood",
		link: `https://greenpastures.vercel.app#gut_brain_superfood`,
		summary:
			"Improves Gut health | It supports good sleep | Increases organic probiotics | Mental Wellness",
		price: 30000,
		old_price: 35000,
		discount: 0,
		qty: 20,
		tags: [],
		image_url: [
			"./images/GUTBrainSuperfood.png",
			"./images/gorontula-removebg.png",
		],
		carousel_image_url: "",
		ingredient: {},
		directions: ``,
		description: `
         GUT Brain Super Food is a powdered dietary supplement crafted from a nutrient-rich blend of vegetables.<br/> These ingredients are dried under controlled conditions to preserve essential vitamins, minerals, and antioxidants vital for overall body health.

         <br/><br/>
         <p><strong>Key benefits include:</strong></p>
         <ul>
            <li>Improves gut health</li>
            <li>It supports good sleep</li>
            <li>Reduces anxiety</li>
            <li>Increases organic probiotics</li>
            <li>Detoxfies heavy metals in the body </li>
            <li>Balances serotonin levels in the body </li>
            <li>Supports a healthy gut microbiome </li>
         </ul>
         <br/>
         For best results <br/> <strong class="pe-2">Adult</strong> 1 Tablespoon in the morning<br/> <strong class="ps-2">Children</strong> 1 Teaspoon in the morning<br/>`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-3",
		title: "Exotic green smoothie",
		slug: "exotic_green_smoothie",
		link: `https://greenpastures.vercel.app#exotic_green_smoothie`,
		summary:
			"Immune Booster | Heart, Liver and Kidney Health | Enhance Digestion",
		price: 20000,
		old_price: 25000,
		discount: 0,
		qty: 37,
		tags: [],
		image_url: [
			"./images/smoothie-removebg.png",
			"./images/capsule-removebg.png",
		],
		carousel_image_url: "./images/deskstopheader.jpg",
		directions: `
			<h6 class="fw-bold mt-3">Directions for Use</h6>
			<p>Mix 1–2 teaspoons in smoothies, yogurt, or fruit juice or water.</p>
			<p><strong>For children:</strong> Start with ½ tsp and observe tolerance.</p>
			<p><strong>For pregnant women:</strong> 1 tsp daily is typically safe, under guidance.</p>
		`,
		ingredient: {
			Vegetables: [
				"Chlorella",
				"Spirulina",
				"Wheat Grass",
				"Barley Grass",
				"Alfalfa Grass",
				"Green Pea",
				"Lemon Peel",
				"Stevia extract",
				"Lemon Juice Powder",
				"Butterfly Pea flowery",
				"Sea Moss",
				"Spinach",
				"Kale",
				"Celery",
				"Beetroot Leaves",
				"Parsley",
				"Broccoli",
				"Moringa Leaves",
				"Sweet Potatoes",
				"Soursop Leaves",
				"Mint Leaves",
				"White cabbage",
			],
			"Seeds and Spices": ["Flax Seed", "Chia Seed", "Pumpkin seed"],
			Adaptogen: ["Ashwagandha", "Reishi Mushroom"],
			Spices: ["Ginger", "Garlic", "Turmeric", "Fennel"],
			"Natural Sweetener": ["Stevia"],
		},
		description: `
         Green Pasture Smoothie is a powdered dietary supplement crafted from a nutrient-rich blend of vegetables, fruits, spices, seeds high in omega-3 and omega-6 fatty acids, and adaptogens. <br/> These ingredients are dried under controlled conditions to preserve essential vitamins, minerals, and antioxidants vital for overall body health.

         This supplement is designed to enhance gut, heart, liver, joint, bone, kidney, and reproductive health while boosting energy and immunity against conditions like malaria and infections. <br/> Simply mix it with water or your favorite smoothie for a natural health boost.
         <br/><br/>
         <p><strong>Key benefits include:</strong></p>
         <ul>
            <li>Supports overall body functionality</li>
            <li>Enhances immunity and energy levels</li>
            <li><strong>💯% natural:</strong> Sweetened with organic nuts and vegetables</li>
         </ul>
         <br />
         For best results, take it daily, preferably in the morning before meals. <br/> Experience the power of natural goodness!`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-4",
		title: "Ultimate Organic Aphrodisiac (For Men)",
		slug: "organic_aphrodisiac",
		link: `https://greenpastures.vercel.app#organic_aphrodisiac`,
		summary:
			"Libido Enhancer, Increased Testosterone, Stress Management, For Erectile Dysfunction, Improved Sperm Quality",
		price: 20000,
		old_price: 24000,
		discount: 0,
		qty: 20,
		tags: [],
		image_url: [
			"./images/capsule-removebg.png",
			"./images/gorontula-removebg.png",
		],
		carousel_image_url: "",
		ingredient: {},
		description: `
         Rediscover your vitality and confidence with our <strong>Organic Aphrodisiac</strong>, a natural blend tailored for men’s health. 
         This powerful formula enhances libido, increases testosterone levels, and supports stress management for optimal well-being.

         <br/><br/>
         <p><strong>Key benefits include:</strong></p>
         <ul>
            <li><strong>Libido Enhancement:</strong> Boosts your drive and performance naturally.</li>
            <li><strong>Increased Testosterone:</strong> Supports hormonal balance for improved energy and stamina.</li>
            <li><strong>Stress Management:</strong> Infused with adaptogens to reduce stress and anxiety.</li>
            <li><strong>For Erectile Dysfunction:</strong> Promotes healthy blood flow to improve performance.</li>
            <li><strong>Improved Sperm Quality:</strong> Enhances sperm quantity and quality for reproductive health.</li>
         </ul>
         <br/>
         Crafted from pure organic ingredients, this supplement is your all-in-one solution for a healthier, more confident you—naturally and effectively!`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-5",
		title: "Goron Tula - Fruit & Powder (For Women)",
		slug: "gorontula",
		link: `https://greenpastures.vercel.app#gorontula`,
		summary: "Enhances reproductive health and boosts immunity naturally",
		price: 10000,
		old_price: 12500,
		discount: 0,
		qty: 15,
		tags: [],
		image_url: [
			"./images/gorontula-removebg.png",
			"./images/smoothie-removebg.png",
		],
		carousel_image_url: "",
		ingredient: {},
		description: `  
         Goron tula is a 100% pure, organic fruit renowned for its aphrodisiac properties and health benefits. It supports gut health, boosts immunity, and enhances reproductive system functionality for both men and women.

         <p><strong>Benefits for Men:</strong></p>
         <ul>
            <li>Improves sperm quality and quantity</li>
            <li>Fortified with adaptogens to reduce stress and anxiety</li>
         </ul>

         <p><strong>Benefits for Women:</strong></p>
         <ul>
            <li>Alleviates vaginal dryness, easing discomfort during intimacy</li>
            <li>Prevents hormonal imbalances</li>
            <li>Protects against vaginal infections and diseases with its natural antibacterial, antifungal, and antimicrobial properties</li>
         </ul>

         <p><strong>Why Choose Green Pasture Gorontula?</strong></p>
         <p>Our formula is enriched with adaptogens to help manage stress and anxiety while enhancing overall well-being.</p>

         <p>Experience the natural power of Gorontula for a healthier, more balanced life.</p>`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-6",
		title: "Purple Super Food",
		slug: "purple_super_food",
		link: `https://greenpastures.vercel.app#purple_super_food`,
		summary:
			"Prevents/Fights Cancer | Reduce Heart Disease Risk | Boost Brain Health | Packed with Antioxidant | Radiant Skin | Pre/Post Workout + Many More",
		price: 24000,
		old_price: 30000,
		discount: 0,
		qty: 16,
		tags: [],
		image_url: ["./images/purple-super-food-preview.png", ""],
		carousel_image_url: "",
		directions: `
    <h6 class="fw-bold mt-3">Directions for Use</h6>
    <p><strong>For Adults (Including Pregnant Women):</strong><br/>Mix 1 teaspoon (≈3g) daily into smoothies, yogurt, juice, or water. May gradually increase to 2 teaspoons per day as tolerated.</p>
    <p><strong>For Children (Ages 3+):</strong><br/>Mix ½ teaspoon (≈1.5g) into smoothies or soft foods once daily. Begin with a smaller amount and increase only if tolerated.</p>
    <p>Best taken in the morning or afternoon.</p>
    <p>For taste, combine with fruit or natural sweeteners.</p>
  `,
		ingredient: {
			"Fruits and Berries": [
				"Amla",
				"Pomegranate",
				"Pineapple",
				"Blackberries",
				"Mulberries",
				"Tomatoes",
				"Beetroot",
				"Carrot",
				"Baobab",
				"Watermelon",
				"Tamarind",
				"Roselle leaves",
			],
			"Seeds and Spices": ["Turmeric", "Ginger", "Black Pepper"],
			Adaptogen: ["Schisandra Berries extract"],
			"Natural Sweetener": ["Stevia"],
		},
		description: ` Home of berries and healthy fruits`,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-7",
		title: "Dates Powder",
		slug: "dates_powder",
		link: `https://greenpastures.vercel.app#dates_powder`,
		summary:
			"Promotes Healthy Pregnancy | Supports Eye Health | Boosts Energy | Aids Digestion | Supports Heart Health | Strengthens Bones | Improves Brain Function | Regulates Blood Sugar",
		price: 4500,
		// old_price: 30000,
		discount: 0,
		qty: 16,
		tags: [],
		image_url: ["./images/dates-powder-preview.png", ""],
		carousel_image_url: "",
		ingredient: {
			Fruits: ["100% Dates"],
		},
		description: `
         <ul>
            <li>Boosts Energy – High in natural sugars like glucose and fructose for a quick energy boost.</li>
            <li>Aids Digestion – Rich in fiber, helping prevent constipation and promoting gut health.</li>
            <li>Supports Heart Health – Contains potassium and antioxidants that help lower blood pressure and reduce heart disease risk.</li>
            <li>Strengthens Bones – Packed with calcium, magnesium, and phosphorus to support bone health.</li>
            <li>Improves Brain Function – Contains antioxidants that protect brain cells and enhance memory.</li>
            <li>Regulates Blood Sugar – Despite being sweet, their fiber content helps slow sugar absorption.</li>
            <li>Promotes Healthy Pregnancy – May aid labor by strengthening uterine muscles and easing delivery.</li>
            <li>Supports Eye Health – Contains vitamin A and carotenoids that benefit vision.</li>
         </ul>
      `,
	},
	{
		id: generateUUID(),
		uid: generateUUID(),
		uuid: "random-8",
		title: "Tigernuts Powder",
		slug: "tigernuts_powder",
		link: `https://greenpastures.vercel.app/index.html#tigernuts_powder`,
		summary:
			"Promotes Healthy Skin | Rich in Fiber | Boosts Energy | Supports Heart Health | Regulates Blood Sugar | Good for Weight Management | Dairy-Free & Nut-Free",
		price: 4000,
		// old_price: 30000,
		discount: 0,
		qty: 16,
		tags: [],
		image_url: ["./images/tigernuts-powder-preview.png", ""],
		carousel_image_url: "",
		directions: ``,

		ingredient: {
			Fruits: ["100% Tiger Nuts"],
		},
		description: `
         <ul>
            <li>Rich in Fiber – Aids digestion, prevents constipation, and supports gut health.</li>
            <li>Boosts Energy – Provides natural carbohydrates for sustained energy.</li>
            <li>Supports Heart Health – Contains healthy fats and helps regulate cholesterol levels.</li>
            <li>Regulates Blood Sugar – Low glycemic index and fiber help prevent sugar spikes.</li>
            <li>Good for Weight Management – High fiber content keeps you full longer.</li>
            <li>Dairy-Free & Nut-Free – Great for people with lactose intolerance or nut allergies.</li>
            <li>Promotes Healthy Skin – Contains vitamin E, which fights aging and nourishes the skin.</li>
         </ul>
      `,
	},
];
