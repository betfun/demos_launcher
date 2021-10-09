import { TestBed } from '@angular/core/testing';

import { SalesforceService } from './salesforce.service';

describe('SalesforceService', () => {
    let service: SalesforceService;
    beforeEach(() => { service = new SalesforceService(); jasmine.DEFAULT_TIMEOUT_INTERVAL = 150000; });

    it('should be created', () => {
        expect(service).toBeTruthy();
    });

    it('should return a list of views', (done: DoneFn) => {
        service.create({ login: 'jverbecque@dassaultaviation2018.demo', pwd: 'Salesforce1' })
            .then(_ => {
                console.log("connected");
                service.getUsers().then(views => {
                    console.log(views.length);
                    expect(views).toBe('promise value');
                    done();
                });
            });
    });
});
