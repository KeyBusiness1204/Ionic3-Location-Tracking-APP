import { Component } from '@angular/core';
import { IonicPage, ViewController, NavController, NavParams } from 'ionic-angular';
import firebase from 'firebase';
import { FirebaseProvider } from '../../providers/firebase/firebase';

@IonicPage()
@Component({
  selector: 'page-inviter',
  templateUrl: 'inviter.html',
})

export class InviterPage {

  public items: any;
  public user: any;
  public users: any;
  public friends: any;
  
  constructor(
      public navCtrl: NavController,       
      public firebaseProvider: FirebaseProvider, 
      public navParams: NavParams,
      public viewCtrl: ViewController,
  )
    {
        this.user = this.firebaseProvider.userData;     
    }

  ionViewDidLoad() {
    console.log('ionViewDidLoad InviterPage');    
    this.users = new Array();
    this.friends = new Array();
    var that = this;
   
    var query = firebase.database().ref("app_users").orderByKey();
    query.once("value").then(function (snapshot) {
    
        var querylist = firebase.database().ref('/friends/'+ that.firebaseProvider.userData.username).orderByKey();
        querylist.once("value").then(function(snap) {
         
            snap.forEach(function(childSnap) {
                that.friends.push(childSnap.val().id); 
            });
            
            snapshot.forEach(function (childSnapshot) {
              
                if((that.firebaseProvider.friendIDs.indexOf(childSnapshot.val().id) != -1) &&
                    (that.friends.indexOf(childSnapshot.val().id) != -1))                    
                    that.users.push(childSnapshot.val());
            });

            that.items = that.users;
            console.log('Items:');console.log(that.items);
        });         
    });     
  }

  dismiss(item) {

    if (item == null)
        this.viewCtrl.dismiss(this.firebaseProvider.userData);
    else
        this.viewCtrl.dismiss(item);
  }

  cancel() {
    this.viewCtrl.dismiss();
  }
}
