export interface Flight {
    id: string;
    flightNumber: string;
    airlineName: string;
    airlineLogo: string;
    departureAirport: string;
    departureCode: string;
    departureCity: string;
    departureTime: string;
    departureDate: string;
    arrivalAirport: string;
    arrivalCode: string;
    arrivalCity: string;
    arrivalTime: string;
    arrivalDate: string;
    duration: string;
    stops: number;
    stopLocations?: string[];
    price: number;
    currency: string;
    cabinClass: 'economy' | 'premium' | 'business' | 'first';
    seatsAvailable: number;
    wifi: boolean;
    entertainment: boolean;
    power: boolean;
    mealIncluded: boolean;
  }
  
  export interface FlightSearchCriteria {
    fromAirport: string;
    toAirport: string;
    departureDate: string;
    returnDate?: string;
    passengers: number;
    tripType: 'oneWay' | 'roundTrip';
    cabinClass?: 'economy' | 'premium' | 'business' | 'first';
  }
  
  export interface FlightBooking {
    id: string;
    userId: string;
    flights: Flight[];
    passengers: Passenger[];
    totalPrice: number;
    currency: string;
    bookingDate: string;
    status: 'pending' | 'confirmed' | 'cancelled';
    paymentStatus: 'pending' | 'paid' | 'refunded';
  }
  
  export interface Passenger {
    firstName: string;
    lastName: string;
    dateOfBirth?: string;
    passport?: string;
    passportExpiry?: string;
    nationality?: string;
    specialRequests?: string[];
  }