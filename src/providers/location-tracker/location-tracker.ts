import { Injectable , NgZone} from '@angular/core';
import { BackgroundGeolocation } from '@ionic-native/background-geolocation';
import { Geolocation, Geoposition } from '@ionic-native/geolocation';
import { Storage} from "@ionic/storage";

import 'rxjs/add/operator/filter';
import 'rxjs/add/operator/map';

@Injectable()
export class LocationTrackerProvider {

    public watch: any;    
    public lat: number = 0;
    public lng: number = 0;
    public locate: any;
    public gps: number;
    public highAccuracy: boolean;

    constructor(    
      public zone: NgZone,
      public backgroundGeolocation : BackgroundGeolocation,
      public geolocation : Geolocation,
      private storage : Storage,       
    ) 
    {
      
      this.storage.get('gps').then(
          data =>{                             
              if(data != null)         
                  this.gps = data;                
              if(data == null)
                  this.gps = 0;
          }
      );

      this.storage.get('high').then(
        data =>{                           
            if(data != null)         
                this.highAccuracy = data;                
            if(data == null)
                this.highAccuracy = true;
        }
      );
    }
     
    startTracking() {              
        // Background Tracking             
        let config = {
          desiredAccuracy: this.gps,
          stationaryRadius: 20,
          distanceFilter: 10, 
          interval: 10000,
          debug: true
        };      

        this.backgroundGeolocation.configure(config).subscribe((location) => {
            
            this.locate = location;        
            // Run update inside of Angular's zone
            this.zone.run(() => {
              this.lat = location.latitude;
              this.lng = location.longitude;             
              console.log("Background");
              console.log(this.lat, this.lng);
            });        
        }, (err) => {      
          console.log(err);      
        });
        this.backgroundGeolocation.start();      
      
        // Foreground Tracking            
        let options = {
          frequency: 10000, 
          enableHighAccuracy: this.highAccuracy
        };                
            
        this.watch = this.geolocation.watchPosition(options).filter((p: any) => p.code === undefined).subscribe((position: Geoposition) => {      
          console.log(position.coords.latitude);
          this.zone.run(() => {
             console.log("Foreground");
            this.lat = position.coords.latitude;
            this.lng = position.coords.longitude;
             console.log(this.lat, this.lng);
          });
        });
    }
    
    stopTracking() {   
        this.backgroundGeolocation.finish();
        this.watch.unsubscribe();
    }
}
