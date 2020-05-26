var app_invite_team = {}; 
document.app_cache = {};
localStorage.setItem("UI_BASE_URL","http://localhost:3000");
// Apps


function attach_timer(element,dateString) {
	if(!dateString){
		return;
	}
	var date = Date.parse(dateString);
	var now = new Date();
	var dif = (new Date(date)).getTime() - now.getTime();
	var Seconds_from_T1_to_T2 = dif / 1000;	
	var seconds = Math.abs(Seconds_from_T1_to_T2);
	function clockwork(element){
		  var days        = Math.floor(seconds/24/60/60);
		  var hoursLeft   = Math.floor((seconds) - (days*86400));
		  var hours       = Math.floor(hoursLeft/3600);
		  var minutesLeft = Math.floor((hoursLeft) - (hours*3600));
		  var minutes     = Math.floor(minutesLeft/60);
		  var remainingSeconds = Math.floor(seconds % 60);
		  function pad(n) {
		    return (n < 10 ? "0" + n : n);
		  }
		  $("#"+element).html(" TO GO " + pad(days) + " Days " + pad(hours) + ":" + pad(minutes) + ":" + pad(remainingSeconds) ) ;
		  if (seconds == 0) {
		    clearInterval(countdownTimer);
		    $("#"+element).html("Completed");
		  } else {
		    seconds--;
		  }
	}
	var countdownTimer = setInterval(function(){clockwork(element)}, 1000);
}
function get_me_request() {
	//http://localhost:8080/auth/me
    return request({
        url: API_BASE_URL + "/auth/me",
        method: 'GET'
    });
}
function getMyTeamAndMatchDetails(id){
	//http://localhost:8080/game/mydata
    return request({
        url: API_BASE_URL + "/game/mydata?userId=" + id,
        method: 'GET'
    });
}

function register_team_request(teamRequest) {
	//http://localhost:8080/game/match/1/create
    return request({
        url: API_BASE_URL + "/game/match/"+ teamRequest.matchId +"/create",
        method: 'POST',
        body: JSON.stringify(teamRequest)
    });
}

function join_team_request(teamRequest) {
	//http://localhost:8080/game/match/1/create
    return request({
        url: API_BASE_URL + "/game/team/"+ teamRequest.teamToken +"/join",
        method: 'POST'
    });
}

function fetch_team_data_by_team_id(id){	
	var url =  API_BASE_URL + "/game/teambyid";
	url = url + "?team_id=" + id;
	//http://localhost:8080/game/teambyid?team=1&match=1
	 return request({
	        url: url,
	        method: 'GET'
	  });
}

function fetch_recent_teams(){	
	var url =  API_BASE_URL + "/game/teams";
	//http://localhost:8080/game/teams
	 return request({
	        url: url,
	        method: 'GET'
	  });
}

function fetch_team_data_team_id_match_id(token, matchId){	
	var url =  API_BASE_URL + "/game/teambyid";
	if(token){
		url = url + "?token=" + token;
		if(matchId){
			url = url + "&match=" + matchId;
		}
	} else {
		url = url + "?match=" + matchId;
	}
	//http://localhost:8080/game/teambyid?team=1&match=1
	 return request({
	        url: url,
	        method: 'GET'
	  });
}

function fetch_match_data_by_id(matchId){
	//http://localhost:8080/matches/1
	  return request({
	        url: API_BASE_URL + "/matches/"+ matchId,
	        method: 'GET'
	    });
}
function fetch_match_request(offset) {
	//http://localhost:8080/game/matches?count=10&offset=0
    return request({
        url: API_BASE_URL + "/game/matches?count=10&offset="+ offset,
        method: 'GET'
    });
}
if(document.getElementById("app_match_details")){
	var requestedMatchId = getParameterByName("match");
	console.log(" Match ->" + requestedMatchId);
	var app_matchDetails =   new Vue({
		  el: '#app_match_details',
		  data: {
			  loading: true,
			  matchData :{}
		  },
		  methods: {
			  fetchMatchDataById : function (id){
				  fetch_match_data_by_id(id)
				    .then(responseGet => {
						  console.log(" Resp =" + responseGet);
						  this.loading = false;
						  this.matchData =  responseGet;
						  console.log("match --" +  this.matchData );
						  attach_timer("ctimer",this.matchData.startDate);
				    }).catch(error => {
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');              
				    });
			  }
		  },
		  beforeMount(){
			  if(requestedMatchId){
				  this.fetchMatchDataById(requestedMatchId);  
			  }
			  
		  }
	});
}
if(document.getElementById("app_match_list")){
	var currentPage = getDomAttr("app_match_list_page_no");
	if(!currentPage){
		currentPage = 1;
	}
	var offset = (currentPage-1) * 10;
	console.log("page="+currentPage + " offset =" + offset);
	var app3 = new Vue({
		  el: '#app_match_list',
		  data: {
			  matches_loading: true,
			  no_matches : false,
			  show_pagination : false,
			  matches : [],
			  size:0
		  },
		  methods: {
			  fetchMatch : function(page){
				  var offset = (page-1) * 10;
				  fetch_match_request(offset)
				    .then(responseGet => {
				    	  
						  console.log(" Resp =" + responseGet);
						  this.matches_loading = false;
						  this.matches =  responseGet.data.matches;
						  console.log("len-"+this.matches.length);
						  if(this.matches.length>0){
							  this.no_matches = false;
							  console.log("name->" + responseGet.data.matches[0].match.name);
						  } else {
							  this.no_matches = true;
						  }
						  this.matches_loading = false;
						  this.size = responseGet.data.total_records;
						  console.log("matches --" + this.matches);
					  
				    }).catch(error => {
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');              
				    });
				  
				  
			  }
		  },
		  beforeMount(){
			    var offset = (currentPage-1) * 10;
			    console.log("offset in before mount = " + offset)
			    this.fetchMatch(currentPage);
			   
		  },
		  computed : {
			  eval_matches_loading: function (){
					 return this.matches_loading; 
			 }
		  }
	
		});
		
}

if(document.getElementById("app_invite_team")){
		 app_invite_team = new Vue({
		  el: '#app_invite_team',
		  data: {
			  loading : true,
			  invited : false,
			  invalid_team : false,
			  matchId : null,
			  alreadyJoinedTeam : null,
			  requestedTeam : null,
			  requestedMatch : null,
			  teamToken : null
		  },
		  methods : {
			  click_join_match : function(){
				var accessToken = getAccessToken();
				
				if(accessToken){
					document.app_pop_window.is_auth = false;
					document.app_pop_window.show_login = false;
					document.app_pop_window.show_registration = false;
					document.app_pop_window.show_join_team = false;
					document.app_pop_window.show_create_team = true;
					document.app_pop_window.requestedTeam = this.requestedTeam;
					document.app_pop_window.requestedMatch = this.requestedMatch;
					document.app_pop_window.teamToken = this.teamToken;
					document.app_pop_window.user = document.app_login_bar.getUser();
									
					
					setDomAttr("is_auth",false);
					setDomAttr("show_login",false);
					setDomAttr("teamToken",this.teamToken);
					setDomAttr("show_registration",false);
					setDomAttr("show_join_team",false);
					setDomAttr("show_create_team",true);
					setDomAttr("requestedTeam",this.requestedTeam);
					setDomAttr("requestedMatch",this.requestedMatch);
					setDomAttr("user",document.app_login_bar.getUser());
					
					$.cookie("retries",3);
					var callOnLogin = function(){
						if(document){
							console.log("saved function-document is found");
						}
						if(!document.app_pop_window){
							console.log("document.app_pop_window is null");
							return;
						}
						storeFunctionToLocalStorage(null);
						
						document.app_pop_window.is_auth = getDomAttr("is_auth");
						document.app_pop_window.show_login = getDomAttr("show_login");
						document.app_pop_window.show_registration = getDomAttr("show_registration");
						document.app_pop_window.show_join_team =getDomAttr("show_join_team");
						document.app_pop_window.show_create_team = getDomAttr("show_create_team");
						document.app_pop_window.requestedTeam = getDomAttr("requestedTeam");
						document.app_pop_window.requestedMatch = getDomAttr("requestedMatch");
						document.app_pop_window.teamToken = getDomAttr("teamToken");
						document.app_pop_window.user = getDomAttr("user");
						$("#app_pop_up").fadeIn(300);
					}
					storeFunctionToLocalStorage(callOnLogin);
					
					
				} else {
					
					
					document.app_pop_window.is_auth = true;
					document.app_pop_window.show_login = true;
					document.app_pop_window.show_registration = false;
					document.app_pop_window.show_join_team = false;
					document.app_pop_window.show_create_team = false;
					document.app_pop_window.requestedTeam = this.requestedTeam;
					document.app_pop_window.requestedMatch = this.requestedMatch;
					document.app_pop_window.teamToken = this.teamToken;
					document.app_pop_window.user = document.app_login_bar.getUser();
					
					setDomAttr("is_auth",false);
					setDomAttr("show_login",false);
					setDomAttr("show_registration",false);
					setDomAttr("show_join_team",false);
					setDomAttr("show_create_team",true);
					setDomAttr("requestedTeam",this.requestedTeam);
					setDomAttr("requestedMatch",this.requestedMatch);
					setDomAttr("teamToken",this.teamToken);
					setDomAttr("user",document.app_login_bar.getUser());
					
					$.cookie("retries",3);

					var callOnLogin = function(){
						if(document){
							console.log("saved function-document is found");
						}
						if(!document.app_pop_window){
							console.log("document.app_pop_window is null");
							return;
						}
						storeFunctionToLocalStorage(null);
						
						document.app_pop_window.is_auth = getDomAttr("is_auth");
						document.app_pop_window.show_login = getDomAttr("show_login");
						document.app_pop_window.show_registration = getDomAttr("show_registration");
						document.app_pop_window.show_join_team =getDomAttr("show_join_team");
						document.app_pop_window.show_create_team = getDomAttr("show_create_team");				
						document.app_pop_window.requestedTeam = getDomAttr("requestedTeam");
						document.app_pop_window.requestedMatch = getDomAttr("requestedMatch");
						document.app_pop_window.user = getDomAttr("user");
						$("#app_pop_up").fadeIn(300);
					}
					storeFunctionToLocalStorage(callOnLogin);
				}
				 $("#app_pop_up").fadeIn(300);
			  },
			  click_join_team : function(){  
					var accessToken = getAccessToken();
					if(accessToken){ // Logged in 
							document.app_pop_window.is_auth = false;
							document.app_pop_window.show_login = false;
							document.app_pop_window.show_registration = false;
							document.app_pop_window.show_join_team = true;
							document.app_pop_window.show_create_team = false;
							document.app_pop_window.requestedTeam = this.requestedTeam;
							document.app_pop_window.requestedMatch = this.requestedMatch;
							document.app_pop_window.user = document.app_login_bar.getUser();
							
							storeFunctionToLocalStorage(null);
							setDomAttr("is_auth",false);
							setDomAttr("show_login",false);
							setDomAttr("show_registration",false);		
							setDomAttr("show_join_team",true);
							setDomAttr("show_create_team",false);
							setDomAttr("requestedTeam",this.requestedTeam);
							setDomAttr("requestedMatch",this.requestedMatch);
							setDomAttr("user",document.app_login_bar.getUser());
							
									
							$.cookie("retries",3);
							var callOnLogin = function(){
								if(document){
									console.log("saved function-document is found");
								}
								if(!document.app_pop_window){
									console.log("document.app_pop_window is null");
									return;
								}
								storeFunctionToLocalStorage(null);
								
								document.app_pop_window.is_auth = getDomAttr("is_auth");
								document.app_pop_window.show_login = getDomAttr("show_login");
								document.app_pop_window.show_registration = getDomAttr("show_registration");
								document.app_pop_window.show_join_team =getDomAttr("show_join_team");
								document.app_pop_window.show_create_team = getDomAttr("show_create_team");
								document.app_pop_window.requestedTeam = getDomAttr("requestedTeam");
								document.app_pop_window.requestedMatch = getDomAttr("requestedMatch");
								document.app_pop_window.teamToken = getDomAttr("teamToken");
								document.app_pop_window.user = getDomAttr("user");
								$("#app_pop_up").fadeIn(300);
							}
							storeFunctionToLocalStorage(callOnLogin);
							
					} else {
					
					
					document.app_pop_window.is_auth = true;
					document.app_pop_window.show_login = true;
					document.app_pop_window.show_registration = false;
					document.app_pop_window.show_join_team = false;
					document.app_pop_window.show_create_team = false;
					document.app_pop_window.requestedTeam = this.requestedTeam;
					document.app_pop_window.requestedMatch = this.requestedMatch;
					document.app_pop_window.teamToken = this.teamToken;
					document.app_pop_window.user = document.app_login_bar.getUser();
					
					setDomAttr("is_auth",false);
					setDomAttr("show_login",false);
					setDomAttr("show_registration",false);
					setDomAttr("show_join_team",true);
					setDomAttr("show_create_team",false);
					setDomAttr("requestedTeam",this.requestedTeam);
					setDomAttr("requestedMatch",this.requestedMatch);
					setDomAttr("teamToken",this.teamToken);
					setDomAttr("user",document.app_login_bar.getUser());
					
					$.cookie("retries",3);

					var callOnLogin = function(){
						if(document){
							console.log("saved function-document is found");
						}
						if(!document.app_pop_window){
							console.log("document.app_pop_window is null");
							return;
						}
						storeFunctionToLocalStorage(null);
						
						document.app_pop_window.is_auth = getDomAttr("is_auth");
						document.app_pop_window.show_login = getDomAttr("show_login");
						document.app_pop_window.show_registration = getDomAttr("show_registration");
						document.app_pop_window.show_join_team =getDomAttr("show_join_team");
						document.app_pop_window.show_create_team = getDomAttr("show_create_team");				
						document.app_pop_window.requestedTeam = getDomAttr("requestedTeam");
						document.app_pop_window.requestedMatch = getDomAttr("requestedMatch");
						document.app_pop_window.user = getDomAttr("user");
						$("#app_pop_up").fadeIn(300);
					}
					storeFunctionToLocalStorage(callOnLogin);
				}
				 $("#app_pop_up").fadeIn(300);
			  }
			  ,
			  validateTeam : function(){
				  
				  var token = getParameterByName("teamToken");
				  var matchId = getParameterByName("match");
				  
				  fetch_team_data_team_id_match_id(token,matchId)
				    .then(responseGet => {
						  this.loading = false;
						  var requestedTeamData = responseGet.data.team;
						  this.requestedTeam = requestedTeamData;
						  if(this.invited && !requestedTeamData){
							  this.invalid_team = true;
						  }
						  this.requestedMatch = responseGet.data.match;
						  this.alreadyJoinedTeam = responseGet.data.alreadyJoinedTeam;
						  this.matchId = responseGet.data.team_matchId;
						  document.app_cache.team = this.requestedTeam;
						  document.app_cache.match = this.requestedMatch;
						  document.app_cache.fetched = true; 
						  if(document.app_recent_teams && this.requestedMatch){
							document.app_recent_teams.match = this.requestedMatch;
							document.app_recent_teams.teams = this.requestedMatch.teams;
							
						  }
						  console.log(" Resp =" + responseGet);
					  
				    }).catch(error => {
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');              
				    });
			  }
		  },
		  beforeMount() {
			  var token = getParameterByName("teamToken");
			  if(token){
				  this.invited = true;
			  }
			  this.validateTeam();
			  this.teamToken = token;
		  }
		});
}

if(document.getElementById("app_pop_up")){
		 document.app_pop_window = new Vue({
		  el: '#app_pop_up',
		  data: {
			 
			pop_up_shown : false,
			notification : null,
			is_auth : true,
			show_login : true,
			show_registration : false,
			show_create_team : false,
			show_join_team : false,
			referrer : null,
			requestedTeam : null,
			requestedMatch : null,
			alreadyJoinedTeam : null,
			teamToken : null
			
			},
			methods : {
				force_show_login_page : function(){
					storeFunctionToLocalStorage(null);
					$.cookie("retries",null);
					this.act_show_login();
				},
				google_login_go: function(){
				    var redirect = window.location.href;
					googleLoginRedirect(redirect);
				},
				send_login_values : function(params){
					login(params)
						.then(response => {
						  hideLoader();
						  setAccessToken(response.accessToken);
						  alertWrapper("You're successfully logged in!!");
						  var currentRetry = $.cookie("retries");
						  var storedFunction = getStoredFunctionFromLocalStorage();
						  if(currentRetry){
							if(storedFunction){
								storedFunction();
								storeFunctionToLocalStorage(null);  
							} 
						  } else { 
							 storeFunctionToLocalStorage(null);  
						  }
						 
						}).catch(error => {
							var storedFunction = getStoredFunctionFromLocalStorage();
							if(error.status == 401){
								var currentRetry = $.cookie("retries");
								if(storedFunction){
									if(currentRetry){
										$.cookie("retries",currentRetry - 1);
									} else {
										location.reload();
									}
								} else {
									$.cookie("retries",null);
								}
								
							}
						    hideLoader();		
						    alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');				   
						});
				},
				act_register_submit : function (){	
					var params = {};
					$("#signup-form" + " :input").not("input[type=submit]").each(function(){
						var input = $(this);
						var name =  input.attr("name");
						var val = input.val();
						console.log(input.attr("name")+"="+input.val());
						params[name] = val;
					});
					showLoader();
					console.log("params="+params);
					signup(params)
						.then(response => {
						    var loginParams = {};
							loginParams.email = params.email; 
							loginParams.password = params.password; 
						    this.send_login_values(loginParams);
							alertWrapper("You're successfully registered. Please login to continue!");
							hideLoader();
						}).catch(error => {
						   hideLoader();
						   alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');            
						});
						
				},
				act_login_submit : function (){				
					var params = {};
					$("#login-form" + " :input").not("input[type=submit]").each(function(){
						var input = $(this);
						var name =  input.attr("name");
						var val = input.val();
						console.log(input.attr("name")+"="+input.val());
						params[name] = val;
					});
					console.log("params="+params);
					showLoader();
					this.send_login_values(params);
					
				},
				act_join_team : function(){
					
				},
				act_show_register : function(){
					this.is_auth = true;
					this.show_login = false;
					this.show_registration = true;
					this.show_create_team = false;
					this.show_join_team = false; 
					this.requestedMatch = null;
					this.alreadyJoinedTeam = null;
					this.requestedTeam = null;
					$("#app_pop_up").fadeIn(500);
					this.pop_up_shown = true;
				},
				act_show_login : function(){
					this.is_auth = true;
					this.show_login = true;
					this.show_registration = false;
					this.show_create_team = false;
					this.show_join_team = false; 
					this.requestedMatch = null;
					this.alreadyJoinedTeam = null;
					this.requestedTeam = null;
					$("#app_pop_up").fadeIn(500);
					this.pop_up_shown = true;
				},
				act_register_submit_match : function(){		
					showLoader();
					var params = {};
					$("#create-team-form" + " :input").not("input[type=submit]").each(function(){
						var input = $(this);
						var name =  input.attr("name");
						var val = input.val();
						console.log(input.attr("name")+"="+input.val());
						params[name] = val;
					});
					params.matchId = this.requestedMatch.id;
					register_team_request(params)
				    .then(responseGet => {
						  console.log(" Resp =" + responseGet);
						  this.loading = false;
						  hideLoader();
						  alertWrapper("Success fully registered");
				    }).catch(error => {
						  hideLoader();
						  this.loading = false;
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');  
						  if(error.status == 401){
							 app_invite_team.click_join_match(); 
						  }
				    });
				},
				act_join_submit_team : function(){		
					showLoader();
					var params = {};
					$("#join-team-form" + " :input").not("input[type=submit]").each(function(){
						var input = $(this);
						var name =  input.attr("name");
						var val = input.val();
						console.log(input.attr("name")+"="+input.val());
						params[name] = val;
					});
					params.teamToken = this.teamToken;
					join_team_request(params)
				    .then(responseGet => {
						  console.log(" Resp =" + responseGet);
						  this.loading = false;
						  hideLoader();
						  alertWrapper("Success fully registered");
				    }).catch(error => {
						  hideLoader();
						  this.loading = false;
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');  
						  if(error.status == 401){
							 app_invite_team.click_join_team(); 
						  }
				    });
				}
				
			},
			mounted(){
				 
			},
			beforeMount() {
				var hash = hasHash();
				console.log("hash->" + hash);
				if(hash == "login"){
					this.is_auth = true;
					show_login = true;
				} else {
					var functionStored = getStoredFunctionFromLocalStorage();
					if(functionStored){
					   functionStored();
					}
					storeFunctionToLocalStorage(null);
				}
				
			}
		});
}


if(document.getElementById("app_banner")){
	document.app_banner = new Vue({	
		  el: '#app_banner',
		  data: {
			 match : {},
			 team : {},
			 joined_team :{}
		  },
		  beforeMount(){
			  if(!document.app_cache.fetched){

				  var token = getParameterByName("teamToken");
				  var matchId = getParameterByName("match");
				  fetch_team_data_team_id_match_id(token,matchId)
				    .then(responseGet => {
						document.app_cache.fetched = true;
						 this.team = responseGet.data.team;
						 this.match = responseGet.data.match;
						 this.joined_team = responseGet.data.alreadyJoinedTeam;
					  
				    }).catch(error => {
						document.app_cache.fetched = false;          
				    });
			  } else {
				  this.match = document.app_cache.match;
				  this.team = document.app_cache.team;
			  }
		  }
		 });
}


if(document.getElementById("app_login_bar")){
	document.app_login_bar = new Vue({	
		  el: '#app_login_bar',
		  data: {
			 user :{}
		  },
		  methods : {
			  getUser : function (){
				return this.user;				
			  },
			  force_show_login_page : function(){
				  if(document.app_pop_window){
					 document.app_pop_window.force_show_login_page();  
				  }
			  },
			  get_me : function(){
				 get_me_request()
				    .then(responseGet => {
						this.user = responseGet;  
				    }).catch(error => {
						this.user = {};
						 setAccessToken(null);
						 storeFunctionToLocalStorage(null); 
						 $.cookie("retries",null);						 
				    });
			  },
			  sign_out : function (){
				  console.log("logging out");
				  setAccessToken(null);
				  alertWrapper("User logged out successfully");    
				  this.user = {};
			  }
		  },
		  beforeMount(){
			  this.get_me();
			  
		  }
});
}

if(document.getElementById("app_team_rating")){
	document.app_team_rating = new Vue({	
		  el: '#app_team_rating',
		  data: {
			 match : {},
			 team : {}
		  },
		  methods : {
			 copyToClipboard : function() {
						  copyText("Team referral link copied : ","team_token_link_input");
			}  
		  },
		  beforeMount(){
				  var teamId = getParameterByName("team");
				  fetch_team_data_by_team_id(teamId)
				    .then(responseGet => {
						 this.team = responseGet.data.team;
						 this.match = responseGet.data.match;
					  
				    }).catch(error => {
						   alertWrapper("Unable to fetch");    
				    });
		  }
		 });
}


if(document.getElementById("app_recent_teams")){
	document.app_recent_teams = new Vue({	
		  el: '#app_recent_teams',
		  data: {
			 match : {},
			 teams : []
		  },
		  beforeMount(){
				
		  }
		 });
}



if(document.getElementById("app_recent_teams_front_page")){
	document.app_recent_teams_front_page = new Vue({	
		  el: '#app_recent_teams_front_page',
		  data: {
			 match : {},
			 teams : []
		  },
		  beforeMount(){
				fetch_recent_teams()
				    .then(responseGet => {
						this.teams = responseGet.data.teams;
				    }).catch(error => {
						  alertWrapper((error && error.message) || 'Oops! Something went wrong. Please try again!');              
				    });
		  }
		 });
}






if(document.getElementById("app_user_details")){
	document.app_user_details = new Vue({	
		  el: '#app_user_details',
		  data: {
			 user : {},
			 teams : [],
			 matches :[],
			 loggedUser : null
		  },
		  methods : {
			 copyToClipboard : function() {
						  copyText("Team referral link copied : ","team_token_link_input");
			}  
		  },
		  beforeMount(){
				  var userId = getParameterByName("user");
				  getMyTeamAndMatchDetails(userId)
				    .then(responseGet => {
						 this.user = responseGet.data.user;
						 this.matches = responseGet.data.matches;
						 this.teams = responseGet.data.teams;
						 this.loggedUser = responseGet.data.loggedUser;
				    }).catch(error => {
						   alertWrapper("Unable to fetch");    
				    });
		  }
		 });
}


$(function(){
	var token = getParameterByName("token");
	var userId = getParameterByName("referrer");
	if(token){
		$.cookie("referrer_team",token);
	}  
	if(userId){
		$.cookie("referrer",userId);
	}
});
$(
function(){
	var clipboard = new ClipboardJS('#copy_referral_link');
	clipboard.on('success', function(e) {
		alert(" Link copied " + e.text)
	});

	clipboard.on('error', function(e) {
		alert("Failed to copy link try manually")
	});
	
	}
);
