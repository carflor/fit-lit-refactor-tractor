import moment from "moment";
import './css/base.scss';
import './css/style.scss';
import $ from 'jquery'
import Chart from 'chart.js';
import './images/person walking on path.jpg';
import './images/The Rock.jpg';

// import userData from './data/users';
// import hydrationData from './data/hydration';
// import sleepData from './data/sleep';
// import activityData from './data/activity';

import User from './User';
import Activity from './Activity';
import Hydration from './Hydration';
import Sleep from './Sleep';
import UserRepo from './User-repo';
import ApiController from './api-controller';

let m = moment();
// console.log(m);

// var historicalWeek = document.querySelectorAll('.historicalWeek');
// var sidebarName = document.getElementById('sidebarName');
// var stepGoalCard = document.getElementById('stepGoalCard');
// var headerText = document.getElementById('headerText');
// var userAddress = document.getElementById('userAddress');
// var userEmail = document.getElementById('userEmail');
// var userStridelength = document.getElementById('userStridelength');
// var friendList = document.getElementById('friendList');
// var hydrationToday = document.getElementById('hydrationToday');
// var hydrationAverage = document.getElementById('hydrationAverage');
// var hydrationThisWeek = document.getElementById('hydrationThisWeek');
// var hydrationEarlierWeek = document.getElementById('hydrationEarlierWeek');
// var sleepToday = document.getElementById('sleepToday');
// var sleepQualityToday = document.getElementById('sleepQualityToday');
// var avUserSleepQuality = document.getElementById('avUserSleepQuality');
// var sleepThisWeek = document.getElementById('sleepThisWeek');
// var sleepEarlierWeek = document.getElementById('sleepEarlierWeek');
// var friendChallengeListToday = document.getElementById('friendChallengeListToday');
// var friendChallengeListHistory = document.getElementById('friendChallengeListHistory');
// var bigWinner = document.getElementById('bigWinner');
// var userStepsToday = document.getElementById('userStepsToday');
// var avgStepsToday = document.getElementById('avgStepsToday');
// var userStairsToday = document.getElementById('userStairsToday');
// var avgStairsToday = document.getElementById('avgStairsToday');
// var userMinutesToday = document.getElementById('userMinutesToday');
// var avgMinutesToday = document.getElementById('avgMinutesToday');
// var userStepsThisWeek = document.getElementById('userStepsThisWeek');
// var userStairsThisWeek = document.getElementById('userStairsThisWeek');
// var userMinutesThisWeek = document.getElementById('userMinutesThisWeek');
// var bestUserSteps = document.getElementById('bestUserSteps');
// var streakList = document.getElementById('streakList');
// var streakListMinutes = document.getElementById('streakListMinutes')
let api = new ApiController();
let userNowId;



const fetchData = () => {
  let userData = api.getUsersData()
  let hydrationData = api.getHydrationData();
  let sleepData = api.getSleepData();
  let activityData = api.getActivityData();

  Promise.all([userData, hydrationData, sleepData, activityData])
    .then(finalValues => {
      let userData = finalValues[0];
      let hydrationData = finalValues[1];
      let sleepData = finalValues[2];
      let activityData = finalValues[3];
      startApp(userData.userData, hydrationData.hydrationData, sleepData.sleepData, activityData.activityData);
    }).catch(error => console.log(error.message))

}

const updateChart = (daysOftheWeek, data, chartId, chartLabel) => {
  var ctx = document.getElementById(`${chartId}`).getContext('2d');
  var myChart = new Chart(ctx, {
      type: 'bar',
      data: {
          labels: daysOftheWeek,
          datasets: [{
              label: `${chartLabel}`,
              data: data,
              backgroundColor: [
                  'rgba(255, 99, 132, 0.2)',
                  'rgba(54, 162, 235, 0.2)',
                  'rgba(255, 206, 86, 0.2)',
                  'rgba(75, 192, 192, 0.2)',
                  'rgba(153, 102, 255, 0.2)',
                  'rgba(255, 159, 64, 0.2)'
              ],
              borderColor: [
                  'rgba(255, 99, 132, 1)',
                  'rgba(54, 162, 235, 1)',
                  'rgba(255, 206, 86, 1)',
                  'rgba(75, 192, 192, 1)',
                  'rgba(153, 102, 255, 1)',
                  'rgba(255, 159, 64, 1)'
              ],
              borderWidth: 1
          }]
      },
      options: {
          scales: {
              yAxes: [{
                  ticks: {
                      beginAtZero: true
                  }
              }]
          }
      }
  });
}


const makeChartData = (hydrationArry, chartId, chartLabel) => {
  let hydrationDataForAWeek = hydrationArry;
  let data = [];
  let daysOftheWeek = []
  hydrationDataForAWeek.forEach(day => {
    data.push(day.split(":").pop())
  })
  hydrationDataForAWeek.forEach(day => {
    daysOftheWeek.push(day.split(":").shift())
  })
  updateChart(daysOftheWeek, data, chartId, chartLabel)
};




function startApp(userData, hydrationData, sleepData, activityData) {
  let userList = [];
  makeUsers(userData, userList);
  let userRepo = new UserRepo(userList);
  let hydrationRepo = new Hydration(hydrationData);
  let sleepRepo = new Sleep(sleepData);
  userNowId = pickUser();
  let activityRepo = new Activity(activityData);
  let userNow = getUserById(userNowId, userRepo);
  let today = makeToday(userRepo, userNowId, hydrationData);
  let randomHistory = makeRandomDate(userRepo, userNowId, hydrationData);
  // historicalWeek.forEach(instance => instance.insertAdjacentHTML('afterBegin', `Week of ${randomHistory}`));
  $('.historicalWeek').prepend(`Week of ${randomHistory}`)
  addInfoToSidebar(userNow, userRepo);
  addHydrationInfo(userNowId, hydrationRepo, today, userRepo, randomHistory);
  addSleepInfo(userNowId, sleepRepo, today, userRepo, randomHistory);
  let winnerNow = makeWinnerID(activityRepo, userNow, today, userRepo);
  addActivityInfo(userNowId, activityRepo, today, userRepo, randomHistory, userNow, winnerNow);
  addFriendGameInfo(userNowId, activityRepo, userRepo, today, randomHistory, userNow);

}

function makeUsers(userData, array) {
  userData.forEach(function(dataItem) {
    let user = new User(dataItem);
    array.push(user);
  })
}

function pickUser() {
  return Math.floor(Math.random() * 50);
}

function getUserById(id, listRepo) {
  return listRepo.getDataFromID(id);
};


function addInfoToSidebar(user, userStorage) {
  // sidebarName.innerText = user.name;
  $('#sidebarName').text(user.name)
  // headerText.innerText = `${user.getFirstName()}'s Activity Tracker`;
  $('#headerText').text(`${user.getFirstName()}'s Activity Tracker`)
  // stepGoalCard.innerText = `Your daily step goal is ${user.dailyStepGoal}.`
  $('#stepGoalCard').text(`Your daily step goal is ${user.dailyStepGoal}.`)
  avStepGoalCard.innerText = `The average daily step goal is ${userStorage.calculateAverageStepGoal()}`;
  // userAddress.innerText = user.address;
  $('#userAddress').text(user.address)
  // userEmail.innerText = user.email;
  $('#userEmail').text(user.email)
  // userStridelength.innerText = `Your stridelength is ${user.strideLength} meters.`;
  $('#userStridelength').text(`Your stridelength is ${user.strideLength} meters.`)
  // friendList.insertAdjacentHTML('afterBegin', makeFriendHTML(user, userStorage))
  $('#friendList').prepend(makeFriendHTML(user, userStorage))
};

function makeFriendHTML(user, userStorage) {
  return user.getFriendsNames(userStorage).map(friendName => `<li class='historical-list-listItem'>${friendName}</li>`).join('');
}

function makeWinnerID(activityInfo, user, dateString, userStorage) {
  return activityInfo.getWinnerId(user, dateString, userStorage)
}

function makeToday(userStorage, id, dataSet) {
  var sortedArray = userStorage.makeSortedUserArray(id, dataSet);
  return sortedArray[0].date;
}

function makeRandomDate(userStorage, id, dataSet) {
  var sortedArray = userStorage.makeSortedUserArray(id, dataSet);
  return sortedArray[Math.floor(Math.random() * sortedArray.length + 1)].date

}

function addHydrationInfo(id, hydrationInfo, dateString, userStorage, laterDateString) {
  // hydrationToday.insertAdjacentHTML('afterBegin', `<p>You drank</p><p><span class="number">${hydrationInfo.calculateDailyOunces(id, dateString)}</span></p><p>oz water today.</p>`);
  $('#hydrationToday').prepend(`<p>You drank</p><p><span class="number">${hydrationInfo.calculateDailyOunces(id, dateString)}</span></p><p>oz water today.</p>`)
  // hydrationAverage.insertAdjacentHTML('afterBegin', `<p>Your average water intake is</p><p><span class="number">${hydrationInfo.calculateAverageOunces(id)}</span></p> <p>oz per day.</p>`)
  $('#hydrationAverage').prepend(`<p>Your average water intake is</p><p><span class="number">${hydrationInfo.calculateAverageOunces(id).toFixed(1)}</span></p> <p>oz per day.</p>`)
  // hydrationThisWeek.insertAdjacentHTML('afterBegin', makeHydrationHTML(id, hydrationInfo, userStorage, hydrationInfo.calculateFirstWeekOunces(userStorage, id)));
  // $('#hydrationThisWeek').prepend(makeHydrationHTML(id, hydrationInfo, userStorage, hydrationInfo.calculateFirstWeekOunces(userStorage, id)))
  $('#hydrationEarlierWeek').prepend(`<canvas id="thisWeekHydrationChart" style="display: block;height: 206px; width: 251px;"></canvas>`);
  // hydrationEarlierWeek.insertAdjacentHTML('afterBegin', makeHydrationHTML(id, hydrationInfo, userStorage, hydrationInfo.calculateRandomWeekOunces(laterDateString, id, userStorage)));
  // $('#hydrationEarlierWeek').prepend(makeHydrationHTML(id, hydrationInfo, userStorage, hydrationInfo.calculateRandomWeekOunces(laterDateString, id, userStorage)))
  $('#hydrationThisWeek').prepend(`<canvas id="earlyWeekHydrationChart" style="display: block;height: 206px;width: 251px;"></canvas>`);
  makeChartData(hydrationInfo.calculateRandomWeekOunces(laterDateString, id, userStorage),"thisWeekHydrationChart", "OZs of Water");
  makeChartData(hydrationInfo.calculateFirstWeekOunces(userStorage, id),"earlyWeekHydrationChart","OZs of Water");
}



function makeHydrationHTML(id, hydrationInfo, userStorage, method) {
  return method.map(drinkData => `<li class="historical-list-listItem">On ${drinkData}oz</li>`).join('');
}

function addSleepInfo(id, sleepInfo, dateString, userStorage, laterDateString) {
  // sleepToday.insertAdjacentHTML("afterBegin", `<p>You slept</p> <p><span class="number">${sleepInfo.calculateDailySleep(id, dateString)}</span></p> <p>hours today.</p>`);
  $('#sleepToday').prepend(`<p>You slept</p> <p><span class="number">${sleepInfo.calculateDailySleep(id, dateString)}</span></p> <p>hours today.</p>`)
  // sleepQualityToday.insertAdjacentHTML("afterBegin", `<p>Your sleep quality was</p> <p><span class="number">${sleepInfo.calculateDailySleepQuality(id, dateString)}</span></p><p>out of 5.</p>`);
  $('#sleepQualityToday').prepend(`<p>Your sleep quality was</p> <p><span class="number">${sleepInfo.calculateDailySleepQuality(id, dateString)}</span></p><p>out of 5.</p>`)
  // avUserSleepQuality.insertAdjacentHTML("afterBegin", `<p>The average user's sleep quality is</p> <p><span class="number">${Math.round(sleepInfo.calculateAllUserSleepQuality() *100)/100}</span></p><p>out of 5.</p>`);
  $('#avUserSleepQuality').prepend(`<p>The average user's sleep quality is</p> <p><span class="number">${Math.round(sleepInfo.calculateAllUserSleepQuality() *100)/100}</span></p><p>out of 5.</p>`)
  // sleepThisWeek.insertAdjacentHTML('afterBegin', makeSleepHTML(id, sleepInfo, userStorage, sleepInfo.calculateWeekSleep(dateString, id, userStorage)));
  $('#sleepThisWeek').prepend(makeSleepHTML(id, sleepInfo, userStorage, sleepInfo.calculateWeekSleep(dateString, id, userStorage)))
  // sleepEarlierWeek.insertAdjacentHTML('afterBegin', makeSleepHTML(id, sleepInfo, userStorage, sleepInfo.calculateWeekSleep(laterDateString, id, userStorage)));
  $('#sleepEarlierWeek').prepend(makeSleepHTML(id, sleepInfo, userStorage, sleepInfo.calculateWeekSleep(laterDateString, id, userStorage)))
}

function makeSleepHTML(id, sleepInfo, userStorage, method) {
  return method.map(sleepData => `<li class="historical-list-listItem">On ${sleepData} hours</li>`).join('');
}

function makeSleepQualityHTML(id, sleepInfo, userStorage, method) {
  return method.map(sleepQualityData => `<li class="historical-list-listItem">On ${sleepQualityData}/5 quality of sleep</li>`).join('');
}

function addActivityInfo(id, activityInfo, dateString, userStorage, laterDateString, user, winnerId) {
  // userStairsToday.insertAdjacentHTML("afterBegin", `<p>Stair Count:</p><p>You</><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'flightsOfStairs')}</span></p>`)
  $('#userStairsToday').prepend(`<p>Stair Count:</p><p>You</><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'flightsOfStairs')}</span></p>`)
  // avgStairsToday.insertAdjacentHTML("afterBegin", `<p>Stair Count: </p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'flightsOfStairs')}</span></p>`)
  $('#avgStairsToday').prepend(`<p>Stair Count: </p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'flightsOfStairs')}</span></p>`)
  // userStepsToday.insertAdjacentHTML("afterBegin", `<p>Step Count:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'numSteps')}</span></p>`)
  $('#userStepsToday').prepend(`<p>Step Count:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'numSteps')}</span></p>`)
  // avgStepsToday.insertAdjacentHTML("afterBegin", `<p>Step Count:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'numSteps')}</span></p>`)
  $('#avgStepsToday').prepend(`<p>Step Count:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'numSteps')}</span></p>`)
  // userMinutesToday.insertAdjacentHTML("afterBegin", `<p>Active Minutes:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'minutesActive')}</span></p>`)
  $('#userMinutesToday').prepend(`<p>Active Minutes:</p><p>You</p><p><span class="number">${activityInfo.userDataForToday(id, dateString, userStorage, 'minutesActive')}</span></p>`)
  // avgMinutesToday.insertAdjacentHTML("afterBegin", `<p>Active Minutes:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'minutesActive')}</span></p>`)
  $('#avgMinutesToday').prepend(`<p>Active Minutes:</p><p>All Users</p><p><span class="number">${activityInfo.getAllUserAverageForDay(dateString, userStorage, 'minutesActive')}</span></p>`)
  // userStepsThisWeek.insertAdjacentHTML("afterBegin", makeStepsHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "numSteps")));
  // $('#userStepsThisWeek').prepend(makeStepsHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "numSteps")))
  $('#userStepsThisWeek').prepend(`<canvas id="stepsThisWeekChart" style="display: block;height: 206px;width: 251px;"></canvas>`)
  makeChartData(activityInfo.userDataForWeek(id, dateString, userStorage, "numSteps"),"stepsThisWeekChart", "Number of Steps");
  // userStairsThisWeek.insertAdjacentHTML("afterBegin", makeStairsHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "flightsOfStairs")));
  // $('#userStairsThisWeek').prepend(makeStairsHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "flightsOfStairs")))
  $('#userStairsThisWeek').prepend(`<canvas id="stairsThisWeekChart" style="display: block;height: 206px;width: 251px;"></canvas>`)
  makeChartData(activityInfo.userDataForWeek(id, dateString, userStorage, "flightsOfStairs"), "stairsThisWeekChart", "Flights Of Stairs");
  // userMinutesThisWeek.insertAdjacentHTML("afterBegin", makeMinutesHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "minutesActive")));
  // $('#userMinutesThisWeek').prepend(makeMinutesHTML(id, activityInfo, userStorage, activityInfo.userDataForWeek(id, dateString, userStorage, "minutesActive")))
  $('#userMinutesThisWeek').prepend(`<canvas id="minutesThisWeekChart" style="display: block;height: 206px;width: 251px;"></canvas>`)
  makeChartData(activityInfo.userDataForWeek(id, dateString, userStorage, "minutesActive"), "minutesThisWeekChart", "Minutes of Activity");
  // bestUserSteps.insertAdjacentHTML("afterBegin", makeStepsHTML(user, activityInfo, userStorage, activityInfo.userDataForWeek(winnerId, dateString, userStorage, "numSteps")));
  // $('#bestUserSteps').prepend(makeStepsHTML(user, activityInfo, userStorage, activityInfo.userDataForWeek(winnerId, dateString, userStorage, "numSteps")))
  $('#bestUserSteps').prepend(`<canvas id="bestUserStepsChart" style="display: block;height: 206px;width: 251px;"></canvas>`)
  makeChartData(activityInfo.userDataForWeek(winnerId, dateString, userStorage, "numSteps"), "bestUserStepsChart", "Steps")
}

function makeStepsHTML(id, activityInfo, userStorage, method) {
  return method.map(activityData => `<li class="historical-list-listItem">On ${activityData} steps</li>`).join('');
}

function makeStairsHTML(id, activityInfo, userStorage, method) {
  return method.map(data => `<li class="historical-list-listItem">On ${data} flights</li>`).join('');
}

function makeMinutesHTML(id, activityInfo, userStorage, method) {
  return method.map(data => `<li class="historical-list-listItem">On ${data} minutes</li>`).join('');
}

function addFriendGameInfo(id, activityInfo, userStorage, dateString, laterDateString, user) {
  // friendChallengeListToday.insertAdjacentHTML("afterBegin", makeFriendChallengeHTML(id, activityInfo, userStorage, activityInfo.showChallengeListAndWinner(user, dateString, userStorage)));
  $('#friendChallengeListToday').prepend(makeFriendChallengeHTML(id, activityInfo, userStorage, activityInfo.showChallengeListAndWinner(user, dateString, userStorage)))
  // streakList.insertAdjacentHTML("afterBegin", makeStepStreakHTML(id, activityInfo, userStorage, activityInfo.getStreak(userStorage, id, 'numSteps')));
  $('#streakList').prepend(makeStepStreakHTML(id, activityInfo, userStorage, activityInfo.getStreak(userStorage, id, 'numSteps')))
  // streakListMinutes.insertAdjacentHTML("afterBegin", makeStepStreakHTML(id, activityInfo, userStorage, activityInfo.getStreak(userStorage, id, 'minutesActive')));
  $('#streakListMinutes').prepend(makeStepStreakHTML(id, activityInfo, userStorage, activityInfo.getStreak(userStorage, id, 'minutesActive')))
  // friendChallengeListHistory.insertAdjacentHTML("afterBegin", makeFriendChallengeHTML(id, activityInfo, userStorage, activityInfo.showChallengeListAndWinner(user, dateString, userStorage)));
  $('#friendChallengeListHistory').prepend(makeFriendChallengeHTML(id, activityInfo, userStorage, activityInfo.showChallengeListAndWinner(user, dateString, userStorage)))
  // bigWinner.insertAdjacentHTML('afterBegin', `THIS WEEK'S WINNER! ${activityInfo.showcaseWinner(user, dateString, userStorage)} steps`)
  $('#bigWinner').prepend(`THIS WEEK'S WINNER! ${activityInfo.showcaseWinner(user, dateString, userStorage)} steps`)
}

function makeFriendChallengeHTML(id, activityInfo, userStorage, method) {
  return method.map(friendChallengeData => `<li class="historical-list-listItem">Your friend ${friendChallengeData} average steps.</li>`).join('');
}

function makeStepStreakHTML(id, activityInfo, userStorage, method) {
  return method.map(streakData => `<li class="historical-list-listItem">${streakData}!</li>`).join('');
}

// startApp();
fetchData();

const eventHandler = (event) => {
  if (event.target.classList.contains('activity-button')) {
    showActivityForm();
  } else if (event.target.classList.contains('sleep-button')) {
    showSleepForm();
  } else if (event.target.classList.contains('back-button')) {
    $('.pop-up-card').hide();
    $('.main-column-hydration, .main-column-activity, .main-column-sleep').removeClass('blur');
  } else if (event.target.classList.contains('activity-submit-button')) {
    buildActivityPostObject();
    $('.pop-up-card').hide();
    $('.main-column-hydration, .main-column-activity, .main-column-sleep').removeClass('blur');
  } else if (event.target.classList.contains('sleep-submit-button')) {
    buildSleepPostObject();
    $('.pop-up-card').hide();
    $('.main-column-hydration, .main-column-activity, .main-column-sleep').removeClass('blur');
  } else if(event.target.classList.contains('hydration-button')) {
    showHydrationForm()
  } else if (event.target.classList.contains("hydration-submit-button")) {
    buildHydrationPostObject();
    $('.pop-up-card').hide();
    $('.main-column-hydration, .main-column-activity, .main-column-sleep').removeClass('blur');
  }

}

const showHydrationForm = () => {
  $('.body-main-infoContainter').prepend(
    `<section class="pop-up-card">
    <form method="post">
      <label for="date">Date</label>
      <input id="date" type="date" name="date" value="${moment().format("YYYY-MM-DD")}"></input>
      <label for="number-of-oz">Number of Oz</label>
      <input id="numOunces" type="number" name="number-of-ozs"></input>
      <button class="hydration-submit-button" type="button" name="submit">Submit</button>
      <button class="back-button" type="button" name="button">Back</button>
    </form>
  </section>`)
  $('.main-column-hydration, .main-column-activity, .main-column-sleep').addClass('blur')
}



const showActivityForm = () => {
  $('.body-main-infoContainter').prepend(
    `<section class="pop-up-card">
    <form method="post">
      <label for="date">Date</label>
      <input id="date" type="date" name="date" value="${moment().format("YYYY-MM-DD")}"></input>
      <label for="step-count">Step Count</label>
      <input id="numSteps" type="number" name="step-count"></input>
      <label for="minutes-active">Minutes Active</label>
      <input id="minutesActive" type="number" name="minutes-active"></input>
      <label for="flights-of-stairs">Flights of Stairs</label>
      <input id="flightsOfStairs" type="number" name="flights-of-stairs"></input>
      <button class="activity-submit-button" type="button" name="submit">Submit</button>
      <button class="back-button" type="button" name="button">Back</button>
    </form>
  </section>`)
  $('.main-column-hydration, .main-column-activity, .main-column-sleep').addClass('blur')
}

const showSleepForm = () => {
  $('.body-main-infoContainter').prepend(
    `<section class="pop-up-card">
    <form method="post">
      <label for="date">Date</label>
      <input id="date" type="date" name="date" value="${moment().format("YYYY-MM-DD")}"></input>
      <label for="hours-slept">Hours Slept</label>
      <input id="hours-slept" type="number" name="hours-slept"></input>
      <label for="sleep-quality">Sleep Quality</label>
      <input id="sleep-quality" type="number" name="sleep-quality"></input>
      <button class="sleep-submit-button" type="button" name="submit">Submit</button>
      <button class="back-button" type="button" name="button">Back</button>
    </form>
  </section>`)
  $('.main-column-hydration, .main-column-activity, .main-column-sleep').addClass('blur')
}

const buildHydrationPostObject = () => {
  let hydrationObj = {
    "userID": Number(`${userNowId}`),
    "date": `${$('#date').val().split('-').join('/')}`,
    "numOunces": Number(`${$("#numOunces").val()}`)
  }
  api.postHydrationData(hydrationObj);
}

const buildActivityPostObject = () => {
  let activityObj = {
    "userID": Number(`${userNowId}`),
    "date": `${$('#date').val().split('-').join('/')}`,
    "numSteps": Number(`${$('#numSteps').val()}`),
    "minutesActive": Number(`${$('#minutesActive').val()}`),
    "flightsOfStairs": Number(`${$('#flightsOfStairs').val()}`),
  }
  api.postActivityData(activityObj);
}

const buildSleepPostObject = () => {
  let sleepObj = {
    "userID": Number(`${userNowId}`),
    "date": `${$('#date').val().split('-').join('/')}`,
    "hoursSlept": Number(`${$('#hours-slept').val()}`),
    "sleepQuality": Number(`${$('#sleep-quality').val()}`),
  }
  console.log(sleepObj)
  api.postSleepData(sleepObj);
}

$('body').click(eventHandler);
