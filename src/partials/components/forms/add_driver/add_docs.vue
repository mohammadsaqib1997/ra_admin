<template lang="pug">
    .box
        .box-header
            h3.box-title Documents
        .box-body
            .row
                .col-md-12
                    .form-group
                        label(for='fm_profile_img') Profile Image
                        input.form-control(type='file' id='fm_profile_img')
                        //p.text-danger.text-right(v-if="typeof formerrors.fm_profile_img !== 'undefined'") {{ formerrors.fm_profile_img.msg }}
                .col-md-12
                    .form-group
                        label(for='fm_cnic_img') Scanned CNIC
                        input.form-control(type='file' id='fm_cnic_img')
                        //p.text-danger.text-right(v-if="typeof formerrors.fm_cnic_img !== 'undefined'") {{ formerrors.fm_cnic_img.msg }}
                .col-md-12
                    .form-group
                        label(for='fm_license_img') Scanned License
                        input.form-control(type='file' id='fm_license_img')
                        //p.text-danger.text-right(v-if="typeof formerrors.fm_license_img !== 'undefined'") {{ formerrors.fm_license_img.msg }}
                .col-md-12
                    .form-group
                        label(for='fm_reg_letter_img') Scanned Registration Letter
                        input.form-control(type='file' id='fm_reg_letter_img')
                        //p.text-danger.text-right(v-if="typeof formerrors.fm_reg_letter_img !== 'undefined'") {{ formerrors.fm_reg_letter_img.msg }}
        .box-footer
            .text-right
                button(type='submit').btn.btn-success Submit
                //i.fa.fa-refresh.fa-spin.fa-3x.fa-fw(style="vertical-align:middle" v-if="formStatus")
</template>

<script>
    export default {
        name: "add_docs"
    }
</script>

<style scoped>

</style>