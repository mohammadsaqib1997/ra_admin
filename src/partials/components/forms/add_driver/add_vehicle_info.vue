<template lang="pug">
    .box
        .box-header
            h3.box-title Vehicle Information
        .box-body
            .row
                .col-md-12
                    .form-group
                        label(for='vehicle') Vehicle Type
                        select.form-control(id='vehicle' v-model='vehicle')
                            option(value='') Select Vehicle Type
                            option(v-for="v in v_list" v-bind:value='v') {{ v }}
                        //p.text-danger.text-right(v-if="typeof formerrors.vehicle !== 'undefined'") {{ formerrors.vehicle.msg }}
                .col-md-6
                    .form-group
                        label(for='model_year') Model Year
                        input.form-control(type='text' id='model_year' v-model='model_year' placeholder='Eg: 2008')
                        //p.text-danger.text-right(v-if="typeof formerrors.model_year !== 'undefined'") {{ formerrors.model_year.msg }}
                .col-md-6
                    .form-group
                        label(for='vehicle_number') Vehicle Number
                        input.form-control(type='text' id='vehicle_number' v-model='vehicle_number' placeholder='Eg: BEL-923')
                        //p.text-danger.text-right(v-if="typeof formerrors.vehicle_number !== 'undefined'") {{ formerrors.vehicle_number.msg }}
                .col-md-12
                    .form-group
                        label(for='make') Make
                        input.form-control(type='text' id='make' v-model='make' placeholder='Eg: Honda')
                        //p.text-danger.text-right(v-if="typeof formerrors.make !== 'undefined'") {{ formerrors.make.msg }}
                .col-md-12
                    .form-group(style="margin-left: 20px;")
                        .checkbox.text-left
                            label
                                input.cusCheckBox(type='checkbox' v-model="owner_v")
                                | Yes, I am the owner of this vehicle
        .box-footer
            .text-right
                button(type='button').btn.btn-success Submit
                //i.fa.fa-refresh.fa-spin.fa-3x.fa-fw(style="vertical-align:middle" v-if="formStatus")
</template>

<script>
    export default {
        name: "add_vehicle_info",
        data () {
            return {
                v_list: ['Bike', 'Car', 'Pickup', 'Truck'],
                vehicle: '',
                model_year: '',
                vehicle_number: '',
                make: '',
                owner_v: false
            }
        }
    }
</script>

<style scoped>

</style>