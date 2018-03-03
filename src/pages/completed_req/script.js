import firebase from 'firebase'
import func from '../../../custom_libs/func'

export default {
    created: function () {
        let self = this;
        $(function () {

        });

        const db = firebase.database();
        self.userRef = db.ref('/users');
        self.userReqRef = db.ref('/user_requests');
        self.completeReqRef = db.ref('/complete_requests');

        let date1 = new Date();
        let date2 = new Date();
        let week_dates = date1.setDate(date1.getDate()-7);
        let actual_date = date2.getDate()+"/"+(date2.getMonth()+1)+"/"+date2.getFullYear();

        self.completeReqRef.once('value').then(function (snap) {
            let comReqDataRender = snap.val();
            let dataKeys = Object.keys(comReqDataRender).reverse();
            let process_complete = 0;
            dataKeys.forEach(function(rq_key){
                let comRqData = comReqDataRender[rq_key];
                self.userReqRef.child(comRqData.client_uid+"/"+rq_key).once('value').then(function (req_snap) {
                    let reqData = req_snap.val();
                    reqData['createdAt'] = func.set_date_ser(new Date(reqData.createdAt));
                    self.all.push(reqData);
                    process_complete++;
                    if(dataKeys.length === process_complete){


                        self.all.forEach(function (val,i) {
                            let split_date = val.createdAt.split(" ")[2];
                            let second_split_date = split_date.split("/");
                            let generate_week_dates = new Date(second_split_date[1]+"-"+second_split_date[0]+"-"+second_split_date[2]).getTime();
                            if(actual_date === split_date){
                                self.today.push(val);
                            }
                            if(week_dates < generate_week_dates){
                                self.week.push(val);
                            }
                        });

                        if (self.all.length > 10) {
                            console.log("Length is gretaer the 10");
                            self.dataToShow = self.all.slice(0, 10);
                            self.currentlyShowing = self.dataToShow.length;
                            self.isNextAvaliable = true;
                        }
                        else {
                            self.dataToShow = self.all;
                            console.log("Length is gretaer the 10");
                        }
                        self.isPrevAvaliable = false;


                        self.dataLoad = false;
                    }
                });
            });
        });
    },
    data: function(){
        return {
            dataLoad: true,
            all: [],
            week: [],
            today: [],
            userRef: null,
            userReqRef: null,
            completeReqRef: null,
            search_table1: "",
            search_table2: "",
            search_table3: "",

            currentlyShowing: 0,
            dataToShow: [],
            isNextAvaliable: false,
            isPrevAvaliable: false,
            counter: 1,
        }
    },
    watch: {
        search_table1: function (val) {
            func.tableSearch(this.$refs.table1, val);
        },
        search_table2: function (val) {
            func.tableSearch(this.$refs.table2, val);
        },
        search_table3: function (val) {
            func.tableSearch(this.$refs.table3, val);
        },
    },
    methods: {

        btnNext: function () {
            let self = this;
            self.dataToShow = self.all.slice(self.currentlyShowing,self.currentlyShowing+10);
            self.currentlyShowing += self.dataToShow.length;
            if(self.all.length <= self.currentlyShowing){
                self.isNextAvaliable = false;
            }
            self.isPrevAvaliable = true;
        },
        btnPrev: function () {
            let self = this;
            self.currentlyShowing -= self.dataToShow.length;
            self.dataToShow = self.all.slice(self.all.length-self.dataToShow.length-10,self.all.length-self.dataToShow.length);

            self.isNextAvaliable = true;
            if( self.currentlyShowing - self.dataToShow.length <= 0){
                self.isPrevAvaliable = false;
            }
        },


    }
}