## Github contributions calendar API

Simple api to extract data from contributions calendar. Modifed so the data response actually makes sense.

### API
`/:user` provides a day-by-day count.
```json
{
    "2019-06-23": 0,
    "2019-06-24": 0,
    "2019-06-25": 6,
    "2019-06-26": 0,
    ...
    "2020-06-21": 3,
    "2020-06-22": 14
}
```

`/:user/monthly` organises it in monthly folders and days. Each month is indexed from 0 to 11 (Jan -> Dec) and each day is indexed from 0. It will give an entire year, but that might be spread out to multiple years.
```json
{
  "2019": [
    ...
    [8,5,9,11,8,12,12,9,2,0,4,0,0,0,2,4,3,2,2,0,0,0,0,0,0,0,0,0,0,0,0]  //December
  ],
  "2020": [
    [0,0,0,0,0,0,1,0,0,0,0,0,0,0,3,0,0,0,1,13,3,0,0,6,2,9,6,2,1,24,5],  //January
    [1,0,0,0,7,0,0,0,0,0,0,0,0,0,1,0,0,0,12,9,3,0,0,0,1,1,2,0,0],       //Feburary
    [0,0,0,2,3,0,0,2,3,0,20,1,0,21,8,0,0,0,3,0,0,0,0,0,4,3,10,3,12,4,2] //March
  ]
}
```

`/:user/tally` just gives a count over the last year
