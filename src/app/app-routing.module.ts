import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Home Component (eager loaded)
import { HomeComponent } from './features/home/home.component';

const routes: Routes = [
  { path: '', component: HomeComponent },
  { 
    path: 'flights', 
    loadChildren: () => import('./features/flight-search/flight-search.module').then(m => m.FlightSearchModule) 
  },
  // { 
  //   path: 'bookings', 
  //   loadChildren: () => import('./features/booking/booking.module').then(m => m.BookingModule) 
  // },
  // { 
  //   path: 'auth', 
  //   loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule) 
  // },
  // { 
  //   path: 'profile', 
  //   loadChildren: () => import('./features/user-profile/user-profile.module').then(m => m.UserProfileModule) 
  // },
  // Fallback route
  { path: '**', redirectTo: '', pathMatch: 'full' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {
    scrollPositionRestoration: 'enabled',
    // Enable for hash based routing if needed
    // useHash: true
  })],
  exports: [RouterModule]
})
export class AppRoutingModule { }