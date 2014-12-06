filters.filter('stargazerAccumulator', function() {
    return function(stargazers) {

        var stargazerList = '';
        if(stargazers) {
            stargazers.forEach(function(stargazer) {
                stargazerList += '<span>' + stargazer.name + '</span><br />';
            });
        }

        return stargazerList;
    };
});
