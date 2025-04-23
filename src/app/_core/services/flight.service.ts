import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { delay } from 'rxjs/operators';
import { Flight, FlightSearchCriteria } from '../models/flight.model';

@Injectable({
  providedIn: 'root'
})
export class FlightService {
  private mockFlights: Flight[] = [
    {
      id: 'f1',
      flightNumber: 'SW 101',
      airlineName: 'SkyWings',
      airlineLogo: 'assets/images/airlines/skywings.svg',
      departureAirport: 'John F. Kennedy Airport',
      departureCode: 'JFK',
      departureCity: 'New York',
      departureTime: '08:30',
      departureDate: '2023-08-15',
      arrivalAirport: 'Heathrow Airport',
      arrivalCode: 'LHR',
      arrivalCity: 'London',
      arrivalTime: '20:45',
      arrivalDate: '2023-08-15',
      duration: '7h 15m',
      stops: 0,
      price: 450,
      currency: 'USD',
      cabinClass: 'economy',
      seatsAvailable: 12,
      wifi: true,
      entertainment: true,
      power: true,
      mealIncluded: true
    },
    {
      id: 'f2',
      flightNumber: 'SW 202',
      airlineName: 'SkyWings',
      airlineLogo: 'assets/images/airlines/skywings.svg',
      departureAirport: 'Los Angeles International Airport',
      departureCode: 'LAX',
      departureCity: 'Los Angeles',
      departureTime: '10:15',
      departureDate: '2023-08-15',
      arrivalAirport: 'Narita International Airport',
      arrivalCode: 'NRT',
      arrivalCity: 'Tokyo',
      arrivalTime: '14:30',
      arrivalDate: '2023-08-16',
      duration: '11h 15m',
      stops: 0,
      price: 780,
      currency: 'USD',
      cabinClass: 'economy',
      seatsAvailable: 5,
      wifi: true,
      entertainment: true,
      power: true,
      mealIncluded: true
    },
    {
      id: 'f3',
      flightNumber: 'SW 303',
      airlineName: 'SkyWings',
      airlineLogo: 'assets/images/airlines/skywings.svg',
      departureAirport: 'Dubai International Airport',
      departureCode: 'DXB',
      departureCity: 'Dubai',
      departureTime: '14:20',
      departureDate: '2023-08-15',
      arrivalAirport: 'Changi Airport',
      arrivalCode: 'SIN',
      arrivalCity: 'Singapore',
      arrivalTime: '02:05',
      arrivalDate: '2023-08-16',
      duration: '7h 45m',
      stops: 0,
      price: 520,
      currency: 'USD',
      cabinClass: 'economy',
      seatsAvailable: 9,
      wifi: true,
      entertainment: true,
      power: true,
      mealIncluded: false
    },
    {
      id: 'f4',
      flightNumber: 'SW 404',
      airlineName: 'SkyWings',
      airlineLogo: 'assets/images/airlines/skywings.svg',
      departureAirport: 'Charles de Gaulle Airport',
      departureCode: 'CDG',
      departureCity: 'Paris',
      departureTime: '09:10',
      departureDate: '2023-08-15',
      arrivalAirport: 'El Prat Airport',
      arrivalCode: 'BCN',
      arrivalCity: 'Barcelona',
      arrivalTime: '11:00',
      arrivalDate: '2023-08-15',
      duration: '1h 50m',
      stops: 0,
      price: 120,
      currency: 'USD',
      cabinClass: 'economy',
      seatsAvailable: 22,
      wifi: false,
      entertainment: false,
      power: true,
      mealIncluded: false
    },
    {
      id: 'f5',
      flightNumber: 'SW 505',
      airlineName: 'SkyWings',
      airlineLogo: 'assets/images/airlines/skywings.svg',
      departureAirport: 'Sydney Airport',
      departureCode: 'SYD',
      departureCity: 'Sydney',
      departureTime: '11:45',
      departureDate: '2023-08-15',
      arrivalAirport: 'Auckland Airport',
      arrivalCode: 'AKL',
      arrivalCity: 'Auckland',
      arrivalTime: '17:00',
      arrivalDate: '2023-08-15',
      duration: '3h 15m',
      stops: 0,
      price: 280,
      currency: 'USD',
      cabinClass: 'economy',
      seatsAvailable: 15,
      wifi: true,
      entertainment: true,
      power: true,
      mealIncluded: true
    }
  ];

  private mockDestinations = [
    {
      id: 'd1',
      name: 'New York',
      description: 'The city that never sleeps',
      price: 299,
      image: 'assets/images/destinations/new-york.jpg'
    },
    {
      id: 'd2',
      name: 'Paris',
      description: 'City of love and lights',
      price: 349,
      image: 'assets/images/destinations/paris.jpg'
    },
    {
      id: 'd3',
      name: 'Tokyo',
      description: 'Where tradition meets the future',
      price: 499,
      image: 'assets/images/destinations/tokyo.jpg'
    },
    {
      id: 'd4',
      name: 'Dubai',
      description: 'Luxury in the desert',
      price: 399,
      image: 'assets/images/destinations/dubai.jpg'
    },
    {
      id: 'd5',
      name: 'Rome',
      description: 'Eternal city of history',
      price: 329,
      image: 'assets/images/destinations/rome.jpg'
    },
    {
      id: 'd6',
      name: 'Sydney',
      description: 'Harbor city of Australia',
      price: 599,
      image: 'assets/images/destinations/sydney.jpg'
    }
  ];

  constructor() { }

  searchFlights(criteria: FlightSearchCriteria): Observable<Flight[]> {
    // In a real app, we would call an API with these criteria
    console.log('Searching flights with criteria:', criteria);
    
    // Simulate an API delay
    return of(this.mockFlights).pipe(delay(800));
  }

  getPopularDestinations(limit: number = 3): Observable<any[]> {
    return of(this.mockDestinations.slice(0, limit)).pipe(delay(300));
  }

  getFlightById(id: string): Observable<Flight | undefined> {
    const flight = this.mockFlights.find(f => f.id === id);
    return of(flight).pipe(delay(300));
  }
  
  getFeaturedFlights(limit: number = 3): Observable<Flight[]> {
    return of(this.mockFlights.slice(0, limit)).pipe(delay(500));
  }
  
  getAllAirports(): Observable<{code: string, name: string, city: string}[]> {
    const airports = [
      { code: 'JFK', name: 'John F. Kennedy Airport', city: 'New York' },
      { code: 'LHR', name: 'Heathrow Airport', city: 'London' },
      { code: 'CDG', name: 'Charles de Gaulle Airport', city: 'Paris' },
      { code: 'LAX', name: 'Los Angeles International Airport', city: 'Los Angeles' },
      { code: 'DXB', name: 'Dubai International Airport', city: 'Dubai' },
      { code: 'SIN', name: 'Changi Airport', city: 'Singapore' },
      { code: 'HND', name: 'Haneda Airport', city: 'Tokyo' },
      { code: 'SYD', name: 'Sydney Airport', city: 'Sydney' },
      { code: 'AKL', name: 'Auckland Airport', city: 'Auckland' },
      { code: 'BCN', name: 'El Prat Airport', city: 'Barcelona' }
    ];
    
    return of(airports);
  }
}