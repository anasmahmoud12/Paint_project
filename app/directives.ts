// directives those like custom html put its name on tag in html of commponent and import it in ts
// whent put directive on any tage object form it create and controctor call and ElementRef send to constructor this is tag directive one it

// .nativeElement this is specific tage this tage send by refrence

// @Hostlistner('name of event ') this  decorator but put it on method in decrator class 

// this mean this method excute in each this event accour 
//  near dircative in tag you can write any name ='' ht
// make the same name in tag and put about it @Input() then the same then intial value 
// we can give value to name of directive it self 
// @Input('name of directife ') andy name :type :intial value 
// this value to directive not specific member the same in tage
// constructor when call not see the values come from outside
// we can solve this 

// to summary make ng g d then give name 
// now you have ts file has class and @Directive({
// directive selector='' this what you put on the tag  tag which has directive make call to contructor of dirctve and send 
// itself to the constructor of tag
// and can give directive selector  value and recive on @Input('name of directive ') any name:type :intil
// or you can write any name on tage ='value ' this value send to directive in @Input the same name :type :intail
// we say this values contructor not see them mean in constructor see intial values not what is sent to dyrective in @Input

// })


// skip pipe now video 7 45
// we have pipe this can apply on value like give it value and 
// make this value in cetain format 
// there is built in pipe 




// component life cycle steps from create when view it 
// commpent destruction when remvoe it to view another 

// so we want take this cycles to make call to methods

// first method make call is constructor 
// to give intial value or DI

// ngOnInit  once when 

// ngOnChanges run more than one when there is input recieved from outside the coppmponenet

// when value of @Input change 

// ngAfterViewOmit run one agter html load to take any tag from view 

// ngOnDestroy call when commpont destroy

// ngOnChange we use it like that interface OnChanges

// ngOnChanges(){
// put here any thing and you gaurantie you see the changes 

// }





// componets interactions 
// parent components and borthers and child
//how send data from component to component 
// unrelated use service
// 
//  
// from parent to child by @Input() decorator in tag of child which in the parent 
// put name of variable and git it vale name ="the value you want to share" make property pinding 
// child use @Input and the same name which in tage 


//  from child to parent by @Output() decorator 
// 
// 
// 
// 