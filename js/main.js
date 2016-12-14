const $form = $("form");
const $name = $("input#name");
const $email = $("#mail");
const $selectDesign = $("select#design");
const $ccNum = $("#cc-num");
const $zip = $("#zip");
const $cvv = $("#cvv");
const $submitButton = $("button[type='submit']");

var nameIsValid;
var emailIsValid;
var activitiesIsValid;
var paymentMethod;
var ccOk;
var ccNumIsValid;
var zipIsValid;
var cvvIsValid;

//Regular expresions for validation
const nameRegex = /^[A-z ]{2,30}$/;
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const ccNumRegex = /^(.{13,16})$/;
const ccNumLetterRegex = /[\D]/;

const zipRegex = /^(\d{5})$/;
const cvvRegex = /^(\d{3})$/;

//Set focus on the first text field
$($name).focus();
//Hide the other jobrole input
$("#other-title").hide();

//reinitializing the form at launch
$name.val("");
$email.val("");
$selectDesign.val("");
$ccNum.val("");
$zip.val("");
$cvv.val("");


//validate the name----------------------------------
var nameValidation = function (name) {
    return nameRegex.test(name);
}

$name.on("keyup", function () {
    nameIsValid = nameValidation($name.val());
    console.log(nameIsValid);
    if (!nameIsValid) {
        $(this).prev().addClass("nameWarning");
    } else if (nameIsValid) {
        $(this).prev().removeClass("nameWarning");
    }
});

//validate the email----------------------------------
var emailValidation = function (email) {
    return emailRegex.test(email);
}


$email.on("keyup", function () {
    emailIsValid = emailValidation($email.val());
    console.log(emailIsValid);
    if (!emailIsValid) {
        $(this).prev().addClass("emailWarning");
    } else if (emailIsValid) {
        $(this).prev().removeClass("emailWarning");

    }
});

//-- ”Job Role” section of the form:       

//selecting the "job role" input
const $jobRole = $("select#title");

//slide the input function
var jobRoleValidation = function () {
    var jobRole = $jobRole.val();
    if (jobRole == "other") {
        $("#other-title").slideDown(150).focus();
    }
}


//The change event is sent to an element when its value changes. Limited to <input> elements, <textarea> boxes and <select> elements. For select boxes, checkboxes, and radio buttons, the event is fired immediately when the user makes a selection with the mouse, but for the other element types the event is deferred until the element loses focus.
//trigger when the select element changes
$jobRole.change(function (e) {
    jobRoleValidation();
});



/*    ”T-Shirt Info” section of the form:*/
//http://www.javascriptkit.com/javatutors/selectcontent.shtml

//An array of objects with the 2 shirts
var shirts = [{
        design: "heartJs",
        size: ["small", "medium", "large", "extra large"],
        color: ["Cornflower-Blue", "Dark-Slate-Grey", "Gold"],
    },

    {
        design: "jsPuns",
        size: ["small", "medium", "large", "extra large"],
        color: ["Tomato", "Steel-Blue", "Dim-Grey"],
    }
];


//find the correct shirt in the array
var findShirt = function (arr) {
    var shirt;

    arr.forEach(function (element) {
        var chosenDesign = $selectDesign.val();

        console.log(chosenDesign);
        if (chosenDesign == (element.design)) {
            console.log("found element");
            shirt = element;

        }

    }, this);

    chosenShirt = shirt;
}


//creates one select element with its options
var createSelectElements = function (shirt, index, labelName) {
    //retrieve all the keys
    var keys = Object.keys(shirt);
    //current key i.e. size
    var key = keys[index];
    //new div to contain the select
    var $newDiv = $(document.createElement("div"));
    //new label
    var $label = $(document.createElement("label")).attr("for", key).text(labelName);
    //select element is created
    var $select = $(document.createElement("select")).attr({
        id: key,
        name: "user_".concat(key)
    });
    //create the options and append them to the select element
    $.each(shirt[key], function (i, item) {
        console.log(item)
        $($select).append($('<option>', {
            value: item,
            text: item.toUpperCase()
        }));
    });
    console.log($select);
    console.log($label);
    //append elements into the div
    $newDiv.append($label);
    $newDiv.append($select);
    //finally append the div
    $("fieldset.shirt").append($newDiv);
}

var chosenShirt;
//remove the original Size and Color select
$selectDesign.parent().siblings().filter("div").remove();

//Whenever select changes 
$selectDesign.change(function (e) {
    //we remove the next selects so that they dont accumulate
    $(this).parent().nextAll().remove();
    //find the current shirt
    findShirt(shirts);
    //Create the size and color select
    createSelectElements(chosenShirt, 1, "Size :");
    createSelectElements(chosenShirt, 2, "Color :");
});

/*      ”Register for Activities” section of the form:     */
//selecting all checkboxes inside the activities fielset
var $allcheckboxes = $("fieldset.activities").find("input[type='checkbox']");

//Initializing the checkboxes
$allcheckboxes.prop("checked", false).attr("disabled", false);;



//whenever the checkboxes change a change on them
$allcheckboxes.change(function () {
    //http://stackoverflow.com/questions/2330209/jquery-checkbox-enable-disable
    //http://stackoverflow.com/questions/8465821/find-all-unchecked-checkbox-in-jquery
    //https://api.jquery.com/checked-selector/
    //get the class of the current element
    var className = $(this).attr("class");
    console.log("checkbox clicked");
    console.log(className);
    //create a class filter string to be used later ----- this solution seems ugly any suggestions?
    var classFilter = "." + className;
    //we filter all the remaining checkboxes by class
    var $incompatibleScheduleEvents = $(this).parent().siblings().children("[type='checkbox']").filter(classFilter);

    //if the current box is checked we have to disable any incompatible activities
    if (this.checked) {
        $incompatibleScheduleEvents.attr("disabled", true);
        $incompatibleScheduleEvents.parent().addClass("scheduleWarning");
        //if the current box is unchecked we have to enable any incompatible activities
    } else {
        $incompatibleScheduleEvents.attr("disabled", false);

        $incompatibleScheduleEvents.parent().removeClass("scheduleWarning");
    }
    //invoke getRunningTotal
    getRunningTotal();
});

//We invoke running total as well here on mouse leave
$("fieldset.activities").on("mouseleave", function () {
    getRunningTotal();
});


//calculating the running total container selector
var getRunningTotal = function () {
    //select all checked checkboxes
    var totalArr = $allcheckboxes.filter(":checked");
    console.log(totalArr);
    //initialize cost
    var runningTotal = 0;
    //for each element in the array, add its value to the total
    $.each(totalArr, function (indexInArray, activity) {
        runningTotal += parseInt($(activity).val());
    });
    console.log(runningTotal);
    //String to display in the total
    var runningTotalText = "your total is " + runningTotal + "€";
    //setting the text and showing the message
    $(".running-total").text(runningTotalText).show();
    //validation activitiesIsValid
    if (runningTotal == 0) {
        activitiesIsValid = false;
    } else {
        activitiesIsValid = true;
    }
    //if activities is not valid show warning
    if (!activitiesIsValid) {
        $("span.running-total").parent().addClass("noActivitiesWarning");
    } else if (activitiesIsValid) {
        $("span.running-total").parent().removeClass("noActivitiesWarning");
    }
}

//    Payment Info section of the form:

//default payment method is credit card
$("select#payment").val("credit card");
$("#paypal-explanation").hide();
$("#bitcoin-explanation").hide();
$("#credit-card").show(500);

$("select#payment").change(function (e) {
    displayPaymentMethod();
});



//displays payment guidelines for user
var displayPaymentMethod = function () {
    //get the current payment value
    paymentMethod = $("select#payment").val();
    //show and hide elements accordingly
    // Could you propose another way to select the elements to hide by using the :not selector
    //
    if (paymentMethod.includes("credit")) {
        $("#credit-card").show(550);
        $("#paypal-explanation, #bitcoin-explanation").hide(400);

    } else if (paymentMethod.includes("paypal")) {
        $("#paypal-explanation").show();
        $("#bitcoin-explanation, #credit-card").hide(400);

    } else if (paymentMethod.includes("bitcoin")) {
        $("#bitcoin-explanation").show();
        $("#paypal-explanation, #credit-card").hide(400);

    } else {
        $("#paypal-explanation, #bitcoin-explanation, #credit-card").hide(450);
    }
}

//Credit card no letters no spaces field between 13 and 16 digits
var ccNumValidation = function (ccNum) {
    return ccNumRegex.test(ccNum);
}

//Credit card has spaces and or letters
var ccNumLettersValidation = function (ccNum) {
    return ccNumLetterRegex.test(ccNum);
}

$ccNum.on("keyup", function () {
    var ccNumValidLength = ccNumValidation($ccNum.val());
    var ccNumHasLettersSpaces = ccNumLettersValidation($ccNum.val())
    ccNumIsValid = ccNumValidLength && !ccNumHasLettersSpaces;
    console.log(ccNumIsValid);

    ccOk = ccNumIsValid && zipIsValid && cvvIsValid;


    if (ccNumHasLettersSpaces) {
        $(this).prev().removeClass("ccNumLengthWarning");
        $(this).prev().addClass("ccNumWarning");
    } else if (!ccNumHasLettersSpaces) {
        $(this).prev().removeClass("ccNumWarning");
        if (!ccNumValidLength) {
            $(this).prev().addClass("ccNumLengthWarning");
        } else if (ccNumValidLength) {
            $(this).prev().removeClass("ccNumLengthWarning");
        }
    }


});

//The zipcode field should accept a 5-digit number
var zipValidation = function (zipNum) {
    return zipRegex.test(zipNum);
}

$zip.on("keyup", function () {
    zipIsValid = zipValidation($zip.val());
    console.log(zipIsValid);

    ccOk = ccNumIsValid && zipIsValid && cvvIsValid;

    if (!zipIsValid) {
        $(this).prev().addClass("zipWarning");
    } else if (zipIsValid) {
        $(this).prev().removeClass("zipWarning");
    }
});

var cvvValidation = function (cvvNum) {
    return cvvRegex.test(cvvNum);
}

$cvv.on("keyup", function () {
    cvvIsValid = cvvValidation($cvv.val());
    console.log(cvvIsValid);

    ccOk = ccNumIsValid && zipIsValid && cvvIsValid;

    if (!cvvIsValid) {
        $(this).prev().addClass("cvvWarning");
    } else if (cvvIsValid) {
        $(this).prev().removeClass("cvvWarning");
    }
});

//when the mouse enters the button we either ebale it or disable it
$submitButton.mouseenter(function (e) {
    enableButton();
});

//enables or disables the button
var enableButton = function () {
    if (nameIsValid && emailIsValid && activitiesIsValid && ccOk) {
        console.log("can submit")
        $submitButton.attr("disabled", false)
    } else if (nameIsValid && emailIsValid && activitiesIsValid && (paymentMethod == "paypal" || paymentMethod == "bitcoin")) {
        $submitButton.attr("disabled", false)
        console.log("can submit")
    } else {
        $submitButton.attr("disabled", true)
        console.log("cannot submit")

    }
}