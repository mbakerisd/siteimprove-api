
year_sub_array = {};
deptTitle = new Array();

deptTitle['RPTTFD']=        'Redevelopment Property Tax Trust Fund Distributions';


deptTitle['RPTTFE']=        'Redevelopment Property Tax Trust Fund Estimates';


deptTitle['LMIHF']=     'Low and Moderate Income Housing Fund Distributions';
deptTitle['OFA']=       'Other Funds and Accounts Distributions';
deptTitle['OFA-PSD']=       'Other Fund and Accounts Property Sale Distributions';
deptTitle['OFA-RUBRD']=     'Return of Unused Bond Reserve Distributions';
deptTitle['OFA-RAFTD']=     'Return of Asset Fund Transfer Distributions';
deptTitle['ROPS-Review']=       'ROPS III - A/C Review letter';
deptTitle['ROPS-Funding']=      'Anticipated RPTTF Funding Schedule for ROPS III';
deptTitle['Oversight']=     'Oversight Board Manual and Appendices';
deptTitle['Finance']=       'Financial Statements, Agreed-upon Procedures Reports, and Payment Schedules';


deptTitle['rpttfd']=        'Redevelopment Property Tax Trust Fund Distributions';


deptTitle['rpttfe']=        'Redevelopment Property Tax Trust Fund Estimates';


deptTitle['lmihf']=     'Low and Moderate Income Housing Fund Distributions';
deptTitle['ofa']=       'Other Funds and Accounts Distributions';
deptTitle['ofa-psd']=       'Other Fund and Accounts Property Sale Distributions';
deptTitle['ofa-rubrd']=     'Return of Unused Bond Reserve Distributions';
deptTitle['ofa-raftd']=     'Return of Asset Fund Transfer Distributions';
deptTitle['rops-review']=       'ROPS III - A/C Review letter';
deptTitle['rops-funding']=      'Anticipated RPTTF Funding Schedule for ROPS III';
deptTitle['oversight']=     'Oversight Board Manual and Appendices';
deptTitle['finance']=       'Financial Statements, Agreed-upon Procedures Reports, and Payment Schedules';


sub_sub_folder = [];
sub_sub_folder['CWD'] = 'Countywide Distribution';
sub_sub_folder['SAD'] = 'Successor Agency Distribution';
sub_sub_folder['TED'] = 'Taxing Entity Distribution';
mL = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];



function onlyUnique(value, index, self) {
    return self.indexOf(value) === index;
}
/* 1st column also */
function generateReport(type, latest){
    //Hide the sublist if it's open
    $("#sublist").hide();
    $("#folderlist").hide();
    $("#filelist li").hide();
    $("#folderlist li").hide();

    //Set up the feed to get based on the type
    var JSONUrl = "https://sdsfeeder.isd.lacounty.gov/FeederFiles/auditor-"+type+"-prod---oracle.json";
    var JSONCallBack = "callbackFunctionName";
    var listData = null;
    var getLatest = latest;
    content = new Array();
    $.ajax({
        type: 'GET',
        url: JSONUrl,
        async: true,
        crossDomain: true,
        contentType: "application/json",
        jsonpCallback: JSONCallBack,
        dataType: 'jsonp',
        success: function(data) {
            folder_content = new Array();

            if(type == 'sa'){
                data.sort(function(a,b) {return a.sds_org_name - b.sds_org_name;});
            }
            else
            {
                if(latest === true){
                    data.sort(function (a, b) {
                        //return a.sds_customer_org_name - b.sds_customer_org_name;
                        if (new Date(a.sds_document_dt) > new Date(b.sds_document_dt))
                            return -1;
                        if (new Date(a.sds_document_dt) < new Date(b.sds_document_dt))
                            return 1;
                        return 0;
                    });
                }
                else {
                    data.sort(function (a, b) {
                        //return a.sds_customer_org_name - b.sds_customer_org_name;
                        if (a.sds_customer_org_name < b.sds_customer_org_name)
                            return -1;
                        if (a.sds_customer_org_name > b.sds_customer_org_name)
                            return 1;
                        return 0;
                    });
                }

            }


            folder_content = new Array();
            field_content = new Array();

            setTimeout(function() {
                $.each(data, function () {
                    field = '';
                    year = new Date(this.sds_document_dt).getFullYear();
                    month = new Date(this.sds_document_dt).getMonth();
                    if (month < 10) {
                        month = "0" + month;
                    }
                    day = new Date(this.sds_document_dt).getDate();
                    if (day < 10) {
                        day = "0" + day;
                    }
                    if (type == 'sa') {
                        field = this.sds_org_name;
                        if (folder_content.indexOf(this.sds_org_name.replace(',','-').replace('&','-').replace('\/','-') ) == -1) {
                            folder_content.push( this.sds_org_name.replace(',','-').replace('&','-').replace('\/','-') );
                            field_content.push(this.sds_customer_org_name);
                        }
                    }
                    else {
                        field = this.sds_customer_org_name.replace(',','-').replace('&','-').replace('\/','-');
                        if (folder_content.indexOf( this.sds_customer_org_name.replace(',','-').replace('&','-').replace('\/','-') ) == -1) {
                            folder_content.push( this.sds_customer_org_name.replace(',','-').replace('&','-').replace('\/','-') );
                            field_content.push(this.sds_customer_org_name);
                        }
                    }

                    filename_array = this.sds_orig_file_name.split(".");

                    var extension = filename_array.pop();
                    file = filename_array.join(".");
                    fileclass = filename_array.join("_");
                    console.log(folder_content);
                    content.push('<li id="doc_' + this.sds_doc_id + '" data-name="srt_' + year + '_' + month + '_' + day + '" class="srt_' + year + '_' + month + '_' + day + ' doc_' + field.toLowerCase().split(" ").join("_") + ' doc year_' + year + ' doc_all"><a href="' + this.sds_published_url + '" data-toggle="tooltip" data-placement="top" target="_blank" title="' + this.sds_title + '">' + this.sds_title + '</a></li>');
                })


                fc = '';
                fc = '<li class="folder_all"><a class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" href="javascript:getYears(\'all\')">All Departments</a></li>';
                if(type == 'reports') {
                    fc += '<li class="folder_all_commissions"><a class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" href="javascript:getYears(\'all_commissions\')">All Commissions</a></li>';
                }
                for (i = 0; i < folder_content.length; i++) {
                    if(folder_content[i].toLowerCase().split(" ").join("_") != 'all_commissions'){
                        fc += '<li class="folder_' + folder_content[i].toLowerCase().split(" ").join("_") + '"><a class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" href="javascript:getYears(\'' + folder_content[i].toLowerCase().split(" ").join("_") + '\')" data-toggle="tooltip" data-placement="top" title="' + folder_content[i] + '">' + field_content[i] + '</a></li>';
                    }
                }

                if (latest === true) {
                    $("#filelist").html(content);
                    $("#filelist li").slice(15, 1500).hide();

                }
                else {
                    $("#folderlist").html(fc);
                    $("#folderlist").show();
                    $("#filelist").html(content);
                    $("#filelist li").hide();
                }
                listData = data;
                $('[data-toggle="tooltip"]').tooltip();
            }, 1200);
        },
        error: function(e) {
            console.log(e.message);
        }
    });



}




/* 3rd column */
function getSubFiles(year,sub){


    sub_folder_content = '';
    dateString = year.replace("year_","").split("_");
    dateToFormat = new Date(parseInt(dateString[0]),parseInt(dateString[1])-1,parseInt(dateString[2]));

    sub_folder_content += '<div class="container"><div class="row custom-report-title">Fiscal Year '+dateString[0]+'</div><div class="row custom-report-sub-title">'+deptTitle[sub]+'</div><div class="row custom-report-year">'+mL[dateToFormat.getMonth()]+' '+(parseInt(dateToFormat.getDate()))+', '+dateToFormat.getFullYear()+'</div>';

    if( year_sub_array[year][sub].length != 0) {
        sub_folder_content += '<div class="panel-group" id="accordion" role="tablist" aria-multiselectable="true"><div class="panel panel-default">';
        //create an accordion
        //sort 3rd row

        //replace ATED with TED
        for (var subsub in year_sub_array[year][sub]) {
            if (year_sub_array[year][sub][subsub] == "ATED"){
                year_sub_array[year][sub][subsub] = "TED";
            }
        }
        year_sub_array[year][sub].sort();

        for (var subsub in year_sub_array[year][sub]) {
            sub_folder_content += ' <div class="card-header panel-heading" role="tab" id="heading_'+year_sub_array[year][sub][subsub]+'">';
            sub_folder_content += '<h5 class="mb-0 row custom-report-sub-sub-title panel-title"> <a data-toggle="collapse" data-parent="#accordion" href="#collapse_'+year_sub_array[year][sub][subsub]+'" aria-expanded="true" aria-controls="collapseOne"> '+ sub_sub_folder[year_sub_array[year][sub][subsub]] + '</a> </h5> </div>';
            //sub_folder_content += '<div class="row custom-report-sub-sub-title">' + sub_sub_folder[year_sub_array[year][sub][subsub]] + '</div>';
            //Lets get the links that are already generated and copy them over to this div
            sub3 = '';
            if (year_sub_array[year][sub][subsub] == "TED"){
                sub3 = "ATED"
            }
            else{
                sub3 = year_sub_array[year][sub][subsub];
            }

            sub_folder_content += '<div id="collapse_'+year_sub_array[year][sub][subsub]+'" class="panel-collapse collapse" role="tabpanel" aria-labelledby="heading_'+year_sub_array[year][sub][subsub]+'"><div class="panel-body">' +
                '<div class="card">' +
                '<div class="card-block">';
            sub_folder_content += "<div class='row custom-report-documents'><ul>";
            results = $(".doc_" + sub + "." + year + ".sub_" + sub3);

            //sort cities
            items = results.sort(function(a,b) {

                return (a.id > b.id) - (a.id < b.id)
            });

            $.each(items, function () {
                sub_folder_content += "<li>" + $(this).html() + "</li>";
            });
            sub_folder_content += "</ul></div></div></div></div></div>";


        }
        sub_folder_content += '</div></div>';
    }
    else{

        //Lets get the links that are already generated and copy them over to this div


        sub_folder_content += "<div class='row custom-report-documents'><ul>";
        results = $(".doc_" + sub + "." + year );
        items = results.sort(function(a,b) {

            return (a.id > b.id) - (a.id < b.id)
        });
        $.each(items, function () {
            sub_folder_content += "<li>" + $(this).html() + "</li>";
        });
        sub_folder_content += "</ul></div>";
    }
    sub_folder_content += '</div>';

    $("#sublist").html(sub_folder_content);
    $("#sublist").show();
    $("#filelist").show();
}

function getSubDate(dept,sub){

    $("#dept_" + sub).siblings().removeClass('active');
    $("#dept_" + sub).addClass('active');
    $("#sublist").html('');
    deptFiles = $('.doc_'+dept.toLowerCase());

    if(deptFiles.length == 0){
        //John, change what you need here
        alert('No files found');
    }
    dateArray = new Array();
    year_sub_array = {};
    $.each(deptFiles,function(){
        listingClass = $(this).attr('class');
        //Get the date
        classesArray = listingClass.split(" ");

        if(year_sub_array[classesArray[1]] == undefined) {
            year_sub_array[classesArray[1]] = {};
        }
        if(year_sub_array[classesArray[1]][sub] == undefined){
            year_sub_array[classesArray[1]][sub] = [];
        }

        if(classesArray.length == 5) {
            if (( year_sub_array[classesArray[1]][sub].indexOf(classesArray[4].replace("sub_", "")) == -1)) {
                year_sub_array[classesArray[1]][sub].push(classesArray[4].replace("sub_", ""));
            }
        }




        if(dateArray.indexOf(classesArray[1]) == -1){
            dateArray.push(classesArray[1]);
        }

    });

    dateContent = '';
    for(i = 0; i < dateArray.length; i++){
        dateString = dateArray[i].replace("year_","").split("_");
        if(dateString[1]<10){
            dateString[1]="0"+dateString[1];
        }
        if(dateString[2]<10){
            dateString[2]="0"+dateString[2];
        }
        dateID = "year_"+dateString[0]+"_"+dateString[1]+"_"+dateString[2];
        dateToFormat = new Date(parseInt(dateString[0]),parseInt(dateString[1])-1,parseInt(dateString[2]));

        dateContent += '<li id="'+dateID+'" class="custom-year"><a  href="javascript:getSubFiles(\''+dateArray[i]+'\',\''+sub+'\')" data-toggle="tooltip" data-placement="top" title="'+dateArray[i]+'">'+mL[dateToFormat.getMonth()]+' '+(parseInt(dateToFormat.getDate()))+', '+dateToFormat.getFullYear()+'</a></li>';
    }
    $("#sublist").html('');
    $("#yearlist").html(dateContent);
    var elem = $('#yearlist').find('li').sort(sortMeSA);
    $("#yearlist").append(elem);

    $("#yearlist").show();


}

/* 1st column */
function generateSAReport(){
    $("#sublist").hide();
    $("#folderlist").hide();
    $("#filelist li").hide();
    var JSONUrl = "https://sdsfeeder.isd.lacounty.gov/FeederFiles/auditor-sa-prod---oracle.json";
    var JSONCallBack = "callbackFunctionName";
    var listData = null;
    $.ajax({
        type: 'GET',
        url: JSONUrl,
        async: true,
        crossDomain: true,
        contentType: "application/json",
        jsonpCallback: JSONCallBack,
        dataType: 'jsonp',
        success: function(data) {

            sortdata = data.sort(function(a,b) {

                return (a.sds_org_subfolder > b.sds_org_subfolder) - (a.sds_org_subfolder < b.sds_org_subfolder)
            });

            deptArray = new Array();

            content =  '';
            sa_folder_content = '';
            sa_file_content = '';
            $.each(data,function() {
                dateAdded = new Date(this.sds_document_dt).getFullYear()+"_"+(new Date(this.sds_document_dt).getMonth()+1)+"_"+(new Date(this.sds_document_dt).getDate());
                dept = this.sds_org_subfolder;
                if(deptArray.indexOf(dept) == -1){
                    deptArray.push(dept);
                }
                field = this.sds_org_subfolder;
                sub_folder = '';
                if(this.sds_org_subsubfolder != ''){
                    sub_folder = ' sub_'+this.sds_org_subsubfolder;
                }
                filename_array = this.sds_orig_file_name.split(".");
                this.sds_orig_file_name.split(".");

                var extension = filename_array.pop();
                filename = filename_array.join(".");
                fileclass = filename_array.join("_");
                sa_file_content += '<li class="doc_'+field.toLowerCase().split(" ").join("_")+' year_'+dateAdded+' doc_all doc'+sub_folder+'" id="'+filename.split(" ").join("_")+'"><a  href="'+this.sds_published_url+'" target="_blank" data-toggle="tooltip" data-placement="top" title="'+filename+'">'+filename+'</a></li>';

            });

            for(i = 0; i < deptArray.length; i++){

                //sa_folder_content += '<li id="dept_'+deptArray[i].toLowerCase().split(" ").join("_")+'"><a href="javascript:getSubDate(\''+deptArray[i]+'\', \''+deptArray[i].toLowerCase()+'\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="'+deptTitle[deptArray[i]]+'">'+deptTitle[deptArray[i]]+'</a></li>';
            }

            sa_folder_content = '<li id="dept_rpttfd"><a href="javascript:getSubDate(\'RPTTFD\', \'rpttfd\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Redevelopment Property Tax Trust Fund Distributions">Redevelopment Property Tax Trust Fund Distributions</a></li><li id="dept_rpttfe"><a href="javascript:getSubDate(\'RPTTFE\', \'rpttfe\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Redevelopment Property Tax Trust Fund Estimates">Redevelopment Property Tax Trust Fund Estimates</a></li><li id="dept_lmihf"><a href="javascript:getSubDate(\'LMIHF\', \'lmihf\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Low and Moderate Income Housing Fund Distributions">Low and Moderate Income Housing Fund Distributions</a></li><li id="dept_ofa"><a href="javascript:getSubDate(\'OFA\', \'ofa\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Other Funds and Accounts Distributions">Other Funds and Accounts Distributions</a></li><li id="dept_ofa-psd"><a href="javascript:getSubDate(\'OFA-PSD\', \'ofa-psd\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Other Fund and Accounts Property Sale Distributions">Other Fund and Accounts Property Sale Distributions</a></li><li id="dept_ofa-rubrd"><a href="javascript:getSubDate(\'OFA-RUBRD\', \'ofa-rubrd\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Return of Unused Bond Reserve Distributions">Return of Unused Bond Reserve Distributions</a></li><li id="dept_rops-review"><a href="javascript:getSubDate(\'ROPS-Review\', \'rops-review\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="ROPS III - A/C Review Letter">ROPS III - A/C Review Letter</a></li><li id="dept_rops-funding"><a href="javascript:getSubDate(\'ROPS-Funding\', \'rops-funding\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Anticipated RPTTF Funding Schedule for ROPS III">Anticipated RPTTF Funding Schedule for ROPS III</a></li><li id="dept_oversight"><a href="javascript:getSubDate(\'Oversight\', \'oversight\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Oversight Board Manual and Appendices">Oversight Board Manual and Appendices</a></li><li id="dept_finance"><a href="javascript:getSubDate(\'Finance\', \'finance\')" class="vc_general vc_btn3 vc_btn3-size-md vc_btn3-shape-square vc_btn3-style-custom vc_btn3-block" role="button" data-toggle="tooltip" data-placement="top" title="Financial Statements, Agreed-Upon Procedures Reports, Payment Schedules (EOPS & ROPS)">Financial Statements, Agreed-Upon Procedures Reports, Payment Schedules (EOPS & ROPS)</a></li>';

            $("#filelist").html(sa_file_content);
            $("#folderlist").html(sa_folder_content);
            $("#folderlist").show();
            $("#folderlist .li").show();



        },
        error: function(e) {
            console.log(e.message);
        }
    });
}

/* 2nd column */
function getYears(obj) {
    $(".folder_" + obj).siblings().removeClass('active');
    $(".folder_" + obj).addClass('active');
    //$("#filelist").html(content);
    years = $(".doc_" + obj).sort(function(a,b) {

            if(a.classList[3] > b.classList[3])
                return -1;
            if(a.classList[3] < b.classList[3])
                return 1;
            return 0;

        }
    );

    yr_arr = new Array();
    $("#filelist li").hide();
    content = '';
    content = '<li class="custom-year folder_3000"><a href="javascript:getFiles(\''+obj+'\')" role="button" data-toggle="tooltip" data-placement="top" title="All Years">All Years</a></li>';

    $.each(years, function () {
        cls = $(this).attr('class');
        className = cls.split(' ');
        className.shift();

        classRep = className.join(' ');


        yr_class = classRep.replace(/\D/g, '');

        if (yr_arr.indexOf(yr_class) == -1) {
            if(obj == "all"){
                content += '<li class="custom-year folder_'+yr_class+'"><a href="javascript:getFiles(\'year_'+yr_class+' doc_all\')" data-toggle="tooltip" data-placement="top" title="'+yr_class+'">'+yr_class+'</a></li>';
            }
            else{
                content += '<li class="custom-year folder_'+yr_class+'"><a href="javascript:getFiles(\''+classRep+'\')" data-toggle="tooltip" data-placement="top" title="'+yr_class+'">'+yr_class+'</a></li>';
            }


            yr_arr.push(yr_class);
        }

    });
    $("#yearlist").html('');
    $("#yearlist").html(content);
    //var elem = $('#yearlist').find('li').sort(sortMe);
    //$('#yearlist').append(elem);
    $("#yearlist").show();
}

/**
 * function getFiles
 * @param obj
 *
 */

function getFiles(obj){
    /* $(".doc_"+obj).siblings().removeClass('active');
     $(".doc_"+obj).addClass('active');
     */

    $("#filelist li").hide();
    if(obj.indexOf("doc") == -1){
        obj = "doc_"+obj;
    }


    var elem = $('#filelist').find('li').sort(sortName);
    $('#filelist').append(elem);
    $("."+obj.split(" ").join(".")).show()



}



function sortMe(a, b) {
    return a.className < b.className;
}

function sortMeSA(a, b) {

    if(a.id > b.id)
        return -1;
    if(a.id < b.id)
        return 1;
    return 0;
}

function sortName(a, b) {

    if(a.getAttribute('data-name').toString() > b.getAttribute('data-name').toString())
        return -1;
    if(a.getAttribute('data-name').toString() < b.getAttribute('data-name').toString())
        return 1;
    return 0;
}


function getSAFiles(obj,sub){
    $("#filelist li").hide();

    if(obj.indexOf("doc") == -1){
        obj = "doc_"+obj;
    }

    $("."+obj.split(" ").join(".")).show();

}