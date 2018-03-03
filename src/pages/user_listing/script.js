import firebase from 'firebase'
import func from '../../../custom_libs/func'
import moment from 'moment'

export default {
    created: function () {
        let self = this;
        $(function () {
            $("body").on('click', '.open_row', function(){
                let grabLink = $(this).attr("data-url");
                if(grabLink !== ""){
                    self.$router.push(grabLink);
                }
            });
        });

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userRef.orderByChild('type').equalTo('client').on('value', function(snap){
            let renderData = snap.val();
            if(renderData !== null) {
                let renderDataKeys = Object.keys(renderData);
                let process_item = 0;
                self.data1 = [];
                renderDataKeys.forEach(function (val) {
                    let item = renderData[val];
                    item['key'] = val;
                    item['time'] = "";
                    if (val.length === 20) {
                        item['time'] = func.set_date_ser(new Date(func.decode_key(val)));
                    } else if (item.hasOwnProperty("createdAt")) {
                        item['time'] = moment(item.createdAt).format("hh:mm A DD/MM/YYYY");
                    }
                    self.data1.push(item);
                    process_item++;
                    if (process_item === renderDataKeys.length) {
                        self.dataLoad = false;
                    }
                });
                if (self.data1.length > 10) {
                    console.log("Length is gretaer the 10");
                    self.dataToShow = self.data1.slice(0, 10);
                    self.currentlyShowing = self.dataToShow.length;
                    self.isNextAvaliable = true;
                }
                else {
                    self.dataToShow = self.data1;
                    console.log("Length is gretaer the 10");
                }
                self.isPrevAvaliable = false;

            }


        });
    },
    data: function(){
        return {
            dataLoad: true,
            data1: [],
            userRef: null,
            search_table: '',
            currentlyShowing: 0,
            dataToShow: [],
            isNextAvaliable: false,
            isPrevAvaliable: false,
            counter: 1
        }
    },
    watch: {
        search_table: function (val) {
            let self = this;
            func.tableSearch(self.$refs.table, val);
        }
    },
    methods: {
        deActive: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    status: 0
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },
        active: function (key, index, event) {
            event.stopPropagation();
            let self = this;
            if(self.userRef){
                self.userRef.child(key).update({
                    status: 1
                }, function (err) {
                    if(err){
                        console.log(err)
                    }
                });
            }
        },

        btnNext: function () {
            let self = this;
            console.log();
            self.dataToShow = self.data1.slice(self.currentlyShowing,self.currentlyShowing+10);
            self.currentlyShowing += self.dataToShow.length;
            if(self.data1.length <= self.currentlyShowing){
                self.isNextAvaliable = false;
            }
            self.isPrevAvaliable = true;
        },
        btnPrev: function () {
            let self = this;
            self.currentlyShowing -= self.dataToShow.length;
            self.dataToShow = self.data1.slice(self.data1.length-self.dataToShow.length-10,self.data1.length-self.dataToShow.length);

            self.isNextAvaliable = true;
            if( self.currentlyShowing - self.dataToShow.length <= 0){
                self.isPrevAvaliable = false;
            }
        },
    }
}