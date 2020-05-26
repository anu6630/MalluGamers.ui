var API_BASE_URL = "http://localhost:8080";
var UI_BASE_URL ="http://localhost:3000";
var ACCESS_TOKEN = "token";

function showLoader(){
	$("#my_preloader").fadeIn(30);
}

function hideLoader(){
	$("#my_preloader").fadeOut(50);
}

function getDomAttr(name){
	return JSON.parse(localStorage.getItem(name));
}
function setDomAttr(name,value){
	return	localStorage.setItem(name,JSON.stringify(value));
}
function setAccessToken(token){
		if(token){
			return localStorage.setItem(ACCESS_TOKEN,token);
		} else {
			localStorage.removeItem(ACCESS_TOKEN); 
		}
}
function getAccessToken(){
	 return localStorage.getItem(ACCESS_TOKEN);
}
var request = (options) => {
    var headers = new Headers({
        'Content-Type': 'application/json',
    })
    
    if(localStorage.getItem(ACCESS_TOKEN)) {
        headers.append('Authorization', 'Bearer ' + localStorage.getItem(ACCESS_TOKEN))
    }
	if(document.cookie){
		headers.append("Cookie",document.cookie.toString());
	}
	var defaults = {headers: headers};
	options.credentials = "include";
    options = Object.assign({}, defaults, options);

    return fetch(options.url, options)
    .then(response => 
        response.json().then(json => {
			if(!json){
				json = {};
			}
			json.status = response.status;
			if(json.status==401){setAccessToken(null);}
            if(!response.ok) {
                return Promise.reject(json);
            }
            return json;
        })
    );
};



function getCurrentUser() {
    if(!localStorage.getItem(ACCESS_TOKEN)) {
        return Promise.reject("No access token set.");
    }

    return request({
        url: API_BASE_URL + "/user/me",
        method: 'GET'
    });
}

var defaultState = "login";

function login(loginRequest) {
    return request({
        url: API_BASE_URL + "/auth/login",
        method: 'POST',
        body: JSON.stringify(loginRequest)
    });
}

function signup(signupRequest) {
    return request({
        url: API_BASE_URL + "/auth/signup",
        method: 'POST',
        body: JSON.stringify(signupRequest)
    });
}
function alertWrapper(msg,type){
	alert(msg);
}







function googleLoginRedirect(url){
	localStorage.setItem("redirect_uri_private",url);
	window.location.replace(API_BASE_URL + "/oauth2/authorize/google?redirect_uri=" + UI_BASE_URL + "/auth.html");
}






function hasHash(){
	if(window.location.hash) {
      var hash = window.location.hash.substring(1); //Puts hash in variable, and removes the # character
      return hash;
      // hash found
  } else {
      return null;
  }
}



$(document).ready(function(){   
    setTimeout(function () {
        $("#app_invite_team").fadeIn(100);
     }, 500);
}); 

function getParameterByName(name, url) {
    if (!url) url = window.location.href;
    name = name.replace(/[\[\]]/g, '\\$&');
    var regex = new RegExp('[?&]' + name + '(=([^&#]*)|&|#|$)'),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, ' '));
}

function storeFunctionToLocalStorage(myFunc){
	if(myFunc){
	  localStorage.setItem('compressedFunc', myFunc.toString());
	} else {
		localStorage.removeItem('compressedFunc');
	}

}
function getStoredFunctionFromLocalStorage(){
	var compressedFunc = localStorage.getItem('compressedFunc');
	// Convert the String back to a function
	if(!compressedFunc){
		return compressedFunc;
	}
	if(compressedFunc){
		var myFunc = eval('(' + compressedFunc + ')');
		return myFunc;
	}
	return null;
}