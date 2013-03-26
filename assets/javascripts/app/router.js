GiddyUp.Router.map(function(){
  //  /
  //      Redirects to /projects
  //  /projects
  //      The "root"
  this.resource('projects', function(){
  //  /projects/:project_id
  //      Display scorecards, highlight selected project
    this.resource('project', { path: ':project_id' }, function(){
  //  /projects/:project_id/scorecards/:scorecard_id
  //      Load tests in matrix, display matrix, lazy-load results
      this.resource('scorecard', { path: 'scorecards/:scorecard_id' }, function(){
  //  /projects/:project_id/scorecards/:scorecard_id/:test_instance_id
  //      Display results for a bubble
        this.resource('test_instance', { path: ':test_instance_id' }, function(){
  //  /projects/:project_id/scorecards/:scorecard_id/:test_instance_id/:test_result_id
  //      Display an individual test result
          this.resource('test_result', { path: ':test_result_id' });
        });
      });
   });
  });
  //  /logs/:test_result_id
  //      Display the log of a test result in the full window
  this.resource('log', {path: '/logs/:log_id' });
});

GiddyUp.IndexRoute = Ember.Route.extend({
  redirect: function(){
    this.transitionTo('projects');
  }
});

GiddyUp.ProjectsRoute = Ember.Route.extend({
  model: function(){
    return GiddyUp.Project.find();
  }
});

GiddyUp.ProjectsIndexRoute = Ember.Route.extend({
  setupController: function(){
    this.controllerFor('projects').set('selectedItem', null);
  },
  renderTemplate: function(){
    this.render('help/projects', { into: 'application', outlet: 'help' });
  }
});

GiddyUp.ProjectIndexRoute = Ember.Route.extend({
  setupController: function(){
    var scorecards = this.controllerFor('scorecards');
    scorecards.set('selectedItem', null);
  },
  renderTemplate: function(){
    this.render('help/scorecards', { into: 'application', outlet: 'help' });
  }
});

GiddyUp.ProjectRoute = Ember.Route.extend({
  model: function(params){
    return GiddyUp.Project.find(params.project_id);
  },
  setupController: function(controller, model){
    var scorecards = this.controllerFor('scorecards'),
        projects = this.controllerFor('projects');

    projects.set('selectedItem', model);
    scorecards.set('model', model.get('scorecards'));
  }
});

GiddyUp.ScorecardRoute = Ember.Route.extend({
  model: function(params){
    return GiddyUp.Scorecard.find(params.scorecard_id);
  },
  setupController: function(controller, model){
    var testInstances = this.controllerFor('test_instances'),
        scorecards = this.controllerFor('scorecards');

    scorecards.set('selectedItem', model);
    testInstances.set('model', model.get('testInstances'));
  }
});

GiddyUp.ScorecardIndexRoute = Ember.Route.extend({
  renderTemplate: function(){
    this.render('help/matrix', {into: 'application', outlet: 'help'});
    this.render('test_instances', {into: 'scorecard'});
  }
});

GiddyUp.TestInstanceRoute = Ember.Route.extend({
  model: function(params){
    var id = params.test_instance_id.match(/^\d+-\d+/)[0];
    return GiddyUp.TestInstance.find(id);
  },
  serialize: function(model, params){
    var segments = [],
        attrs = ['id', 'name', 'platform', 'backend', 'upgradeVersion'];
    attrs.forEach(function(attrName){
      var attr = model.get(attrName);
      if(attr)
        segments.push(attr);
    });
    return { test_instance_id: segments.join('-') };
  },
  setupController: function(controller, model){
    var testResults = this.controllerFor('test_results');
    testResults.set('model', model.get('testResults'));
    this.render('test_instance', {into: 'scorecard'});
  }
});

GiddyUp.TestInstanceIndexRoute = Ember.Route.extend({
  setupController: function(){
    var testResults = this.controllerFor('test_results');
    testResults.set('selectedItem', null);
    this.render('help/test_instance', {into: 'application', outlet: 'help'});
    this.render();
  }
});

GiddyUp.TestResultRoute = Ember.Route.extend({
  model: function(params){
    return GiddyUp.TestResult.find(params.test_result_id);
  },
  setupController: function(controller, model){
    var testResults = this.controllerFor('test_results');
    testResults.set('selectedItem', model);
    this.render();
    this.render('help/test_result', {into: 'application', outlet: 'help'});
  }
});

GiddyUp.LogRoute = Ember.Route.extend({
  helpWasShowing: false,
  activate: function(){
    $('img.cowboy').hide();
    this.set('helpWasShowing', $('#help').is(':visible'))
    $('#help').hide();
  },
  deactivate: function(){
    $('img.cowboy').show();
    if(this.get('helpWasShowing'))
      $('#help').show();
  }
});
