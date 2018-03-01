import firebase from 'firebase'
import func from '../../../custom_libs/func'
import googleStyle from './style_json.json'
import _ from 'lodash'

import SimpleVueValidation from 'simple-vue-validator'
const Validator = SimpleVueValidation.Validator;

export default {
    created: function () {
        let self = this;

        self.$watch('sel_amount', function (val, oldVal) {
            self.sel_amount = self.$root.isNumber(val, oldVal, 100000);
        });

        $(function () {
            if (!self.$root.mapLoaded) {
                $.getScript("https://maps.googleapis.com/maps/api/js?key=AIzaSyCeDfncmN-9FXb-1Gv4wcRpDWZ4AUnrqws&libraries=places")
                    .done(function (script, textStatus) {
                        self.$root.mapLoaded = true;
                        self.mapInit();
                    })
                    .fail(function (jqxhr, settings, exception) {
                        console.log("Triggered ajaxError handler.");
                    });
            } else {
                self.mapInit();
            }
        });
    },
    data: function () {
        const db = firebase.database();
        return {
            dataLoad: true,
            dataLoad1: true,
            dataLoad2: true,
            all: {},
            reqBidsData: {},
            driversData: {},
            liveDriverData: {},

            userRef: db.ref('/users'),
            userReqRef: db.ref('/user_requests'),
            driverBidsRef: db.ref('/driver_bids'),
            liveReqRef: db.ref('/user_live_requests'),
            onlineDriversRef: db.ref('/online_drivers'),
            addaListRef: db.ref('/adda_list'),
            // map variables
            map: null,
            markers: {},
            dMarkers: {},
            addaMarkers: {},
            infoWindows: null,
            // push bid fields
            sel_req_id: "",
            sel_driver: "",
            sel_amount: 0,
            mainErr: "",
            mainMsg: "",
            insProc: false
        }
    },
    validators: {
        sel_driver: function (value) {
            return Validator.value(value).required();
        }
    },
    methods: {
        mapInit: function () {
            let self = this;
            setTimeout(function () {
                let latlng = new google.maps.LatLng(24.908063, 67.120899);
                let mapOptions = {
                    center: latlng,
                    zoom: 12,
                    styles: googleStyle
                };
                self.map = new google.maps.Map(document.getElementById('map'), mapOptions);
                self.infoWindows = new google.maps.InfoWindow();
                self.loadLiveReq();
                self.loadLiveDriver();
                self.loadAddaPins();
            }, 1000);
        },
        loadAddaPins () {
            const self = this;
            self.addaListRef.once('value', function (snap) {
                if (snap.val() !== null) {
                    let data = snap.val();
                    snap.forEach(function (adda_item) {
                        let key = adda_item.key;
                        let row = adda_item.val();
                        let selLL = new google.maps.LatLng(parseFloat(row.location.lat), parseFloat(row.location.lng));
                        self.addaMarkers[key] = new google.maps.Marker({
                            position: selLL,
                            map: self.map,
                            icon: {
                                url: "/images/icons/warehouse.png",
                                scaledSize: new google.maps.Size(50, 50)
                            }
                        });
                    });
                }
            });
        },
        loadLiveReq: function () {
            let self = this;
            self.liveReqRef.on('value', function (liveSnap) {
                let liveVal = liveSnap.val();
                self.dataLoad = true;
                self.all = {};

                if (liveVal !== null) {
                    let clientUIDKeys = Object.keys(liveVal);
                    let process_complete = 0;
                    clientUIDKeys.forEach(function (uid) {
                        let liveRqData = liveVal[uid];
                        self.userReqRef.child(uid + "/" + liveRqData.reqId).once('value').then(function (reqSnap) {
                            let reqData = reqSnap.val();
                            if (reqData !== null) {
                                reqData['createdAt'] = func.set_date_ser(new Date(reqData.createdAt));
                                self.driverBidsRef.child(liveRqData.reqId).on('value', function (bidSnap) {
                                    let bidData = bidSnap.val();
                                    reqData['num_bids'] = (bidData !== null) ? Object.keys(bidData).length : 0;
                                    self.userRef.child(uid).once('value').then(function (userSnap) {
                                        let userData = userSnap.val();
                                        reqData['username'] = userData.first_name + " " + userData.last_name;
                                        reqData["liveReqKey"] = uid;
                                        self.all[reqSnap.key] = reqData;
                                        if (self.dataLoad) {
                                            process_complete++;
                                            if (clientUIDKeys.length === process_complete) {
                                                self.all = func.sortObj(self.all);
                                                self.markerChange(self.all);
                                                self.dataLoad = false;
                                            }
                                        }
                                    });
                                });
                            } else {
                                self.dataLoad = false;
                            }
                        });
                    });
                } else {
                    self.dataLoad = false;
                }
            });
        },
        loadLiveDriver: function () {
            let self = this;
            self.onlineDriversRef.on('value', function (snap) {
                let data = snap.val();
                if (data !== null) {
                    self.liveDriverData = data;
                } else {
                    self.liveDriverData = {};
                }
                self.driverMarkerChange();
            });
        },
        driverMarkerChange: function () {
            let self = this;
            if (self.map) {
                let keys = Object.keys(self.liveDriverData);
                self.checkMarker(self.liveDriverData, self.dMarkers);

                let vehicles = {
                    Bike: "/images/icons/bike_pin.png",
                    Car: "/images/icons/car_pin.png",
                    Pickup: "/images/icons/pickup_pin.png",
                    Truck: "/images/icons/truck_pin.png"
                };

                if (keys.length > 0) {
                    keys.forEach(function (row) {
                        let itemSel = self.liveDriverData[row];
                        let pin = {
                            url: vehicles[itemSel.vehicle],
                            scaledSize: new google.maps.Size(35, 35)
                        };
                        let selLL = new google.maps.LatLng(parseFloat(itemSel.lat), parseFloat(itemSel.lng));
                        if (self.dMarkers.hasOwnProperty(row)) {
                            self.dMarkers[row].setPosition(selLL);
                            self.dMarkers[row].setIcon(pin);
                        } else {
                            self.dMarkers[row] = new google.maps.Marker({
                                position: selLL,
                                map: self.map,
                                icon: pin
                            });
                        }
                        google.maps.event.clearListeners(self.dMarkers[row], 'click');
                        self.dMarkers[row].addListener('click', function () {
                            self.map.setZoom(18);
                            self.map.setCenter(self.dMarkers[row].getPosition());
                            self.infoWindows.setContent("<div id='map_content'><i class='fa fa-refresh fa-2x fa-spin'></i></div>");
                            self.infoWindows.open(self.map, self.dMarkers[row]);
                            self.loadDriverInfo(row);
                        });
                    });
                }
            }
        },
        markerChange: function (obj) {
            let self = this;
            if (self.map) {
                self.checkMarker(obj, self.markers);
                if (obj !== null) {
                    let keys = Object.keys(obj);
                    let key_length = keys.length;
                    let processItem = 0;
                    let pin = {
                        url: "/images/map_pin.png",
                        scaledSize: new google.maps.Size(35, 35)
                    };
                    let boundbox = new google.maps.LatLngBounds();
                    keys.forEach(function (row) {
                        let itemSel = obj[row];
                        let selLL = new google.maps.LatLng(parseFloat(itemSel.orgLat), parseFloat(itemSel.orgLng));
                        self.markers[row] = new google.maps.Marker({
                            position: selLL,
                            map: self.map,
                            title: itemSel.orgText,
                            icon: pin
                        });
                        boundbox.extend(selLL);
                        processItem++;
                        if (processItem === key_length) {
                            if (self.dataLoad) {
                                self.map.setCenter(boundbox.getCenter());
                                self.map.fitBounds(boundbox);
                            }
                        }
                    });
                }
            }
        },
        checkMarker: function (obj, markerObj) {
            let keys = Object.keys(markerObj);
            keys.forEach(function (key) {
                if (!obj.hasOwnProperty(key)) {
                    markerObj[key].setMap(null);
                    delete markerObj[key];
                }
            });
        },
        openBidsReq: function (req_id) {
            let self = this;
            self.resetBidForm(self);
            self.sel_req_id = req_id;
            self.driverBidsRef.child(req_id).on('value', function (reqBidsSnap) {
                let bidsData = reqBidsSnap.val();
                self.dataLoad1 = true;
                self.reqBidsData = {};
                if (bidsData !== null) {
                    let keys = Object.keys(bidsData);
                    let key_length = keys.length;
                    let processItem = 0;
                    keys.forEach(function (row) {
                        let selBidItem = bidsData[row];
                        self.userRef.child(row).once('value').then(function (userSnap) {
                            let userData = userSnap.val();
                            self.reqBidsData[row] = {
                                user: userData,
                                bid_amount: selBidItem.amount
                            };
                            processItem++;
                            if (processItem === key_length) {
                                self.reqBidsData = func.sortObjByVal(self.reqBidsData, "bid_amount");
                                self.dataLoad1 = false;
                            }
                        });
                    });
                } else {
                    self.dataLoad1 = false;
                }
            });
            self.userRef.orderByChild('type').equalTo('driver').on('value', function (driversSnap) {
                let driversData = driversSnap.val();
                if (driversData !== null) {
                    let keys = Object.keys(driversData);
                    let key_length = keys.length;
                    let processItem = 0;
                    keys.forEach(function (row) {
                        let selDriver = driversData[row];
                        //active status check
                        if(selDriver.status === 1){
                            self.driversData[row] = {
                                val: row,
                                option: selDriver.mob_no + " ~ " + selDriver.first_name + " " + selDriver.last_name
                            };
                        }

                        processItem++;
                        if (processItem === key_length) {
                            self.dataLoad2 = false;
                        }
                    });
                } else {
                    self.dataLoad2 = false;
                }
            });
        },
        placeBid: function () {
            let self = this;
            self.$validate().then(function (success) {
                if (success) {
                    self.insProc = true;
                    self.userRef.child(self.sel_driver).once('value').then(function (selDriverSnap) {
                        let driverData = selDriverSnap.val();
                        if (driverData !== null) {
                            self.driverBidsRef.child(self.sel_req_id).child(self.sel_driver).set({
                                amount: (self.sel_amount).toString()
                            }, function (err) {
                                if (err) {
                                    self.mainErr = err.message;
                                } else {
                                    self.resetBidForm(self, true);
                                }
                            });
                        } else {
                            self.mainErr = "Invalid Driver Select!";
                        }
                    });
                }
            });
        },
        resetBidForm: function (self, success) {
            success = (typeof self.mainErr !== 'undefined') ? success : false;
            self.insProc = false;
            self.sel_driver = "";
            self.sel_amount = 0;
            self.validation.reset();
            self.mainErr = "";
            if (success) {
                self.mainMsg = "Successfully place bid!";
                setTimeout(function () {
                    self.mainMsg = "";
                }, 3000);
            }
        },
        cancelReq: function (key) {
            let self = this;
            if(confirm("Are You Sure! You want to cancel this request!")){
                self.liveReqRef.child(self.all[key].liveReqKey).remove(function (err) {
                    if(err){
                        console.log(err);
                    }
                });
            }
        },
        loadDriverInfo: function (key) {
            const self = this;
            self.userRef.child(key).once("value", function (snap) {
                if(snap.val() !== null){
                    let data = snap.val();
                    let num_bids = 0;
                    self.driverBidsRef.once('value', function (bid_snap) {
                        if(bid_snap.val() !== null){
                            let find_obj = _.filter(bid_snap.val(), key);
                            num_bids = find_obj.length;
                        }
                        self.infoWindows.setContent(`<div id='map_content'>
<p><b>Name: </b><a href="/admin/drivers/profile/${key}" target="_blank">${data.first_name +" "+ data.last_name}</a></p>
<p><b>Number Of Bids Place: </b>${num_bids}</p>
</div>`);
                    });
                }else {
                    console.error("No Data Found in this key: "+key);
                }
            });
        }
    }
}