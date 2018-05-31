import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, AlertController, Loading, MenuController,LoadingController  } from 'ionic-angular';
import { Facebook ,FacebookLoginResponse} from '@ionic-native/facebook';
import { MapPage } from '../map/map';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import { Storage} from "@ionic/storage";

@IonicPage()
@Component({
  selector: 'page-login',
  templateUrl: 'login.html',
})
export class LoginPage {

    loading : Loading;
  
    constructor(
      public navCtrl: NavController,
      public navParams: NavParams,
      public facebook: Facebook,    
      private alertCtrl: AlertController,
      private loadingCtrl: LoadingController , 
      public menu: MenuController,
      public firebaseProvider: FirebaseProvider,
      private storage : Storage, 
      
    ) 
    {
      this.menu.enable(false, 'safe_menu');      
    }

    ionViewDidLoad() {    
     
    }

    loginFacebook(){ 
    
      this.facebook.login(['email', 'user_friends', 'public_profile']).then((response: FacebookLoginResponse) => { 
          var text =  'Login...';
          this.showLoading(text);  

          this.facebook.api('me?fields=id,name,email,picture.width(720).height(720).as(picture_large)', []).then(profile => {                           
           
              var userData = {id: profile['id'], email: profile['email'], username: profile['name'], picture: profile['picture_large']['data']['url']};
              this.storage.set('user_auth', userData); // if authed
              this.navCtrl.push(MapPage, { 
                  userdata : userData
              });
          });
      }).catch(e => {
        var text = "Login Error!";
        this.showAlert(text); 
      });
    }

    showAlert(text) {
      
        let alert = this.alertCtrl.create({
          title: 'Warning!',
          subTitle: text,
          buttons: [{
            text: "OK",
          }]
        });
        alert.present();
    }

    showLoading(text) {
      this.loading = this.loadingCtrl.create({
        content: text,
        dismissOnPageChange: true,
        showBackdrop: false 
      });
      this.loading.present();
    }
}
