import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams } from 'ionic-angular';
import { FirebaseProvider } from '../../providers/firebase/firebase';
import firebase from 'firebase';
/**
 * Generated class for the UsersPage page.
 *
 * See http://ionicframework.com/docs/components/#navigation for more info
 * on Ionic pages and navigation.
 */

@IonicPage()
@Component({
  selector: 'page-users',
  templateUrl: 'users.html',
})
export class UsersPage {
  public users: any;
  public items: any;
  public friends: any;
  constructor(public navCtrl: NavController, public navParams: NavParams, public firebaseProvider: FirebaseProvider,) {
  }

  ionViewDidLoad() {
    console.log('ionViewDidLoad UsersPage');
  
    this.users = new Array();
    this.friends = new Array();
    var that = this;

    var query = firebase.database().ref("app_users").orderByKey();
    query.once("value").then(function (snapshot) {

        var query = firebase.database().ref('/friends/'+ that.firebaseProvider.userData.username).orderByKey();
        query.once("value").then(function(snap) {
            snap.forEach(function(childSnap) {
                that.friends.push(childSnap.val().id); 
            });

            snapshot.forEach(function (childSnapshot) {
              
                if((that.firebaseProvider.friendIDs.indexOf(childSnapshot.val().id) != -1) && 
                    (that.friends.indexOf(childSnapshot.val().id) != -1))                    
                    that.users.push(childSnapshot.val());
            });

            that.items = that.users;
            console.log(that.items);
        });         
    });
  }

  unFriend(id){
    this.firebaseProvider.removeUser(id);    
  }

}
