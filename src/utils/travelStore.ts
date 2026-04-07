export type DestinationCategory = 'beach' | 'mountain' | 'city';

export interface Destination {
	id: string;
	name: string;
	location: string;
	category: DestinationCategory;
	image: string;
	rating: number;
	description: string;
	visitHours: number;
	foodCost: number;
	hotelCost: number;
	transportCost: number;
}

export interface ItineraryItem {
	id: string;
	day: number;
	destinationId: string;
}

export interface PlanHistoryRecord {
	id: string;
	createdAt: string;
	items: ItineraryItem[];
	totalBudget: number;
	categoryTotals: {
		food: number;
		hotel: number;
		transport: number;
	};
	totalTravelMinutes: number;
}

export const CATEGORY_LABELS: Record<DestinationCategory, string> = {
	beach: 'Biển',
	mountain: 'Núi',
	city: 'Thành phố',
};

const DESTINATIONS_KEY = 'travel_destinations';
const ITINERARY_KEY = 'travel_current_itinerary';
const HISTORY_KEY = 'travel_plan_history';

const defaultDestinations: Destination[] = [
	{
		id: '1',
		name: 'Đà Nẵng',
		location: 'Đà Nẵng',
		category: 'beach',
		image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80',
		rating: 4.8,
		description: 'Thành phố biển năng động, phù hợp nghỉ dưỡng và khám phá ẩm thực.',
		visitHours: 8,
		foodCost: 450000,
		hotelCost: 900000,
		transportCost: 350000,
	},
	{
		id: '2',
		name: 'Nha Trang',
		location: 'Khánh Hòa',
		category: 'beach',
		image: 'https://images.unsplash.com/photo-1500375592092-40eb2168fd21?auto=format&fit=crop&w=1200&q=80',
		rating: 4.6,
		description: 'Bãi biển đẹp, hoạt động vui chơi biển đa dạng.',
		visitHours: 7,
		foodCost: 500000,
		hotelCost: 850000,
		transportCost: 400000,
	},
	{
		id: '3',
		name: 'Sa Pa',
		location: 'Lào Cai',
		category: 'mountain',
		image: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80',
		rating: 4.9,
		description: 'Khí hậu mát mẻ, cảnh núi rừng và ruộng bậc thang nổi bật.',
		visitHours: 9,
		foodCost: 400000,
		hotelCost: 1000000,
		transportCost: 500000,
	},
	{
		id: '4',
		name: 'Đà Lạt',
		location: 'Lâm Đồng',
		category: 'mountain',
		image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1200&q=80',
		rating: 4.7,
		description: 'Thành phố ngàn hoa, khí hậu dễ chịu, nhiều điểm check-in.',
		visitHours: 8,
		foodCost: 380000,
		hotelCost: 780000,
		transportCost: 420000,
	},
	{
		id: '5',
		name: 'Hà Nội',
		location: 'Hà Nội',
		category: 'city',
		image: 'https://images.unsplash.com/photo-1528127269322-539801943592?auto=format&fit=crop&w=1200&q=80',
		rating: 4.5,
		description: 'Thủ đô giàu văn hóa, nhiều điểm tham quan và ẩm thực.',
		visitHours: 6,
		foodCost: 450000,
		hotelCost: 950000,
		transportCost: 300000,
	},
	{
		id: '6',
		name: 'TP. Hồ Chí Minh',
		location: 'TP. Hồ Chí Minh',
		category: 'city',
		image: 'https://images.unsplash.com/photo-1583417319070-4a69db38a482?auto=format&fit=crop&w=1200&q=80',
		rating: 4.4,
		description: 'Đô thị hiện đại, sôi động về giải trí và mua sắm.',
		visitHours: 6,
		foodCost: 520000,
		hotelCost: 1100000,
		transportCost: 350000,
	},
	{
		id: '7',
		name: 'Phú Quốc',
		location: 'Kiên Giang',
		category: 'beach',
		image: 'https://images.unsplash.com/photo-1519046904884-53103b34b206?auto=format&fit=crop&w=1200&q=80',
		rating: 4.9,
		description: 'Đảo nghỉ dưỡng cao cấp, biển đẹp, phù hợp gia đình và cặp đôi.',
		visitHours: 8,
		foodCost: 700000,
		hotelCost: 1500000,
		transportCost: 650000,
	},
	{
		id: '8',
		name: 'Hội An',
		location: 'Quảng Nam',
		category: 'city',
		image: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?auto=format&fit=crop&w=1200&q=80',
		rating: 4.8,
		description: 'Phố cổ, không gian văn hóa đặc sắc, phù hợp lịch trình thư giãn.',
		visitHours: 5,
		foodCost: 420000,
		hotelCost: 820000,
		transportCost: 280000,
	},
];

function canUseStorage() {
	return typeof window !== 'undefined';
}

function readJson<T>(key: string, fallback: T): T {
	if (!canUseStorage()) return fallback;
	try {
		const raw = localStorage.getItem(key);
		return raw ? (JSON.parse(raw) as T) : fallback;
	} catch (error) {
		return fallback;
	}
}

function writeJson<T>(key: string, value: T) {
	if (!canUseStorage()) return;
	localStorage.setItem(key, JSON.stringify(value));
	window.dispatchEvent(new Event('travel-storage'));
}

export function generateId() {
	return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function seedTravelData() {
	if (!canUseStorage()) return;
	const currentDestinations = readJson<Destination[]>(DESTINATIONS_KEY, []);
	if (!currentDestinations.length) {
		localStorage.setItem(DESTINATIONS_KEY, JSON.stringify(defaultDestinations));
	}

	const currentItinerary = readJson<ItineraryItem[]>(ITINERARY_KEY, []);
	if (!currentItinerary.length) {
		localStorage.setItem(ITINERARY_KEY, JSON.stringify([]));
	}

	const currentHistory = readJson<PlanHistoryRecord[]>(HISTORY_KEY, []);
	if (!currentHistory.length) {
		localStorage.setItem(HISTORY_KEY, JSON.stringify([]));
	}
}

export function getDestinations() {
	seedTravelData();
	return readJson<Destination[]>(DESTINATIONS_KEY, defaultDestinations);
}

export function saveDestinations(destinations: Destination[]) {
	writeJson(DESTINATIONS_KEY, destinations);
}

export function getCurrentItinerary() {
	seedTravelData();
	return readJson<ItineraryItem[]>(ITINERARY_KEY, []);
}

export function saveCurrentItinerary(items: ItineraryItem[]) {
	writeJson(ITINERARY_KEY, items);
}

export function getPlanHistory() {
	seedTravelData();
	return readJson<PlanHistoryRecord[]>(HISTORY_KEY, []);
}

export function addPlanHistory(record: PlanHistoryRecord) {
	const current = getPlanHistory();
	writeJson(HISTORY_KEY, [record, ...current]);
}

export function getDestinationTotalCost(destination: Destination) {
	return destination.foodCost + destination.hotelCost + destination.transportCost;
}

export function estimateTravelMinutesBetween(a?: Destination, b?: Destination) {
	if (!a || !b) return 0;
	if (a.id === b.id) return 10;
	if (a.location === b.location) return 25;
	if (a.category === b.category) return 90;
	return 180;
}

export function calculatePlanSummary(items: ItineraryItem[], destinations: Destination[]) {
	const destinationMap = new Map(destinations.map((item) => [item.id, item]));
	const sortedItems = [...items].sort((a, b) => a.day - b.day);

	const categoryTotals = {
		food: 0,
		hotel: 0,
		transport: 0,
	};

	let totalBudget = 0;
	let totalTravelMinutes = 0;

	const groupedByDay = sortedItems.reduce<Record<number, ItineraryItem[]>>((acc, item) => {
		if (!acc[item.day]) acc[item.day] = [];
		acc[item.day].push(item);
		return acc;
	}, {});

	sortedItems.forEach((item) => {
		const destination = destinationMap.get(item.destinationId);
		if (!destination) return;

		categoryTotals.food += destination.foodCost;
		categoryTotals.hotel += destination.hotelCost;
		categoryTotals.transport += destination.transportCost;
		totalBudget += getDestinationTotalCost(destination);
	});

	Object.values(groupedByDay).forEach((dayItems) => {
		dayItems.forEach((currentItem, index) => {
			if (index === 0) return;
			const prev = destinationMap.get(dayItems[index - 1].destinationId);
			const current = destinationMap.get(currentItem.destinationId);
			totalTravelMinutes += estimateTravelMinutesBetween(prev, current);
		});
	});

	return {
		totalBudget,
		categoryTotals,
		totalTravelMinutes,
		totalDays: sortedItems.length ? Math.max(...sortedItems.map((item) => item.day)) : 0,
		totalDestinations: sortedItems.length,
	};
}
