window.applicationConfig = {
    url: 'http://localhost:3000',
    clientID: '00000000-0000-0000-0000-000000000000',
    tenantID: '00000000-0000-0000-0000-000000000000',
    protectedRoutes: [
        {url: new RegExp(/\/api\/v2\/settings/), method: 'PUT' },
        {url: new RegExp(/\/api\/v2\/configurations\/(.+)\/updatefilepath/), method: 'PUT' },
        {url: new RegExp(/\/api\/v2\/configurations\/(.+)/), method: 'PUT' },
    ]
};
