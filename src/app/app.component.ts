import {Component, OnInit} from '@angular/core';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {

  constructor(private route: ActivatedRoute,
              private router: Router) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(queryParamMap => {
      const page = queryParamMap.get('page');
      if (page) {
        this.router.navigate([`/${page}`]);
      }
    });
  }

}
