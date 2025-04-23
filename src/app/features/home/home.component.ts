import { Component, OnInit } from '@angular/core';
import { LanguageService } from '../../_core/services/language.service';
import { FlightService } from '../../_core/services/flight.service';
import { Flight } from '../../_core/models/flight.model';

@Component({
  selector: 'app-home',
  standalone: false,
  templateUrl: 'home.component.html',
  styles: [`
    .section-title {
      font-weight: 700;
      font-size: 2.25rem;
      margin-bottom: 1rem;
    }
    
    .section-subtitle {
      color: var(--bs-secondary);
      font-size: 1.1rem;
      max-width: 700px;
      margin-left: auto;
      margin-right: auto;
    }
    
    .hero-section {
      background-color: var(--bs-primary);
      color: white;
      padding: 5rem 0;
      margin-bottom: 3rem;
    }
    
    .hero-title {
      font-size: 3rem;
      font-weight: 700;
      margin-bottom: 1rem;
    }
    
    .hero-subtitle {
      font-size: 1.25rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }
    
    .hero-image {
      max-height: 400px;
    }
    
    .featured-flights-section {
      padding: 5rem 0;
    }
    
    .features-section {
      padding: 5rem 0;
      background-color: #f8f9fa;
      
      :host-context(.dark-mode) & {
        background-color: var(--bs-dark);
      }
    }
    
    .feature-card {
      height: 100%;
      padding: 2rem;
      background-color: white;
      border-radius: 10px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.05);
      transition: transform 0.3s, box-shadow 0.3s;
      
      &:hover {
        transform: translateY(-10px);
        box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
      }
      
      :host-context(.dark-mode) & {
        background-color: #2a2a2a;
        box-shadow: 0 5px 15px rgba(0, 0, 0, 0.2);
      }
    }
    
    .destinations-section {
      padding: 5rem 0;
    }
    
    .destination-card {
      position: relative;
      border-radius: 10px;
      overflow: hidden;
      height: 300px;
      box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
      transition: box-shadow 0.3s ease;
      
      &:hover {
        box-shadow: 0 10px 30px rgba(0, 0, 0, 0.2);
        
        .destination-image {
          transform: scale(1.1);
        }
      }
    }
    
    .destination-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      transition: transform 0.5s ease;
    }
    
    .destination-info {
      position: absolute;
      bottom: 0;
      left: 0;
      right: 0;
      padding: 1.5rem;
      background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
      color: white;
      
      h3 {
        margin-bottom: 0.5rem;
        font-weight: 600;
      }
      
      p {
        margin-bottom: 1rem;
        opacity: 0.9;
        font-size: 0.9rem;
      }
    }
    
    .price {
      font-weight: 700;
      font-size: 1.2rem;
    }
    
    /* RTL adjustments via the rtl-support directive */
    :host-context(.rtl) {
      .text-center {
        text-align: center !important; /* Ensure centered text remains centered */
      }
    }
    
    @media (max-width: 992px) {
      .hero-section {
        padding: 3rem 0;
      }
      
      .hero-title {
        font-size: 2.5rem;
      }
      
      .section-title {
        font-size: 1.75rem;
      }
      
      .search-form-container {
        margin-top: 2rem;
      }
      
      .featured-flights-section,
      .features-section,
      .destinations-section {
        padding: 3rem 0;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  popularDestinations: any[] = [];
  featuredFlights: Flight[] = [];
  isLoading = true;
  isLoadingDestinations = true;
  
  constructor(
    public languageService: LanguageService,
    private flightService: FlightService
  ) {}
  
  ngOnInit(): void {
    this.loadFeaturedFlights();
    this.loadPopularDestinations();
  }
  
  loadFeaturedFlights(): void {
    this.isLoading = true;
    this.flightService.getFeaturedFlights(3).subscribe(
      flights => {
        this.featuredFlights = flights;
        this.isLoading = false;
      },
      error => {
        console.error('Error loading featured flights:', error);
        this.isLoading = false;
      }
    );
  }
  
  loadPopularDestinations(): void {
    this.isLoadingDestinations = true;
    this.flightService.getPopularDestinations(6).subscribe(
      destinations => {
        this.popularDestinations = destinations;
        this.isLoadingDestinations = false;
      },
      error => {
        console.error('Error loading destinations:', error);
        this.isLoadingDestinations = false;
      }
    );
  }
}