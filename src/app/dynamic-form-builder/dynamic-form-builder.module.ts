import {NgModule} from '@angular/core';
import {BrowserModule} from '@angular/platform-browser';
import {ReactiveFormsModule, FormsModule} from '@angular/forms';

import {FontAwesomeModule} from '@fortawesome/angular-fontawesome';


import {
	MatAutocompleteModule,
	MatCheckboxModule,
	MatFormFieldModule,
	MatInputModule, MatRadioModule, MatSelectModule,
	MatSliderModule,
	MatTabsModule,
	MatExpansionModule,
	MatButtonToggleModule
} from '@angular/material';
import {TextMaskModule} from 'angular2-text-mask';

// components
import {DynamicFormBuilderComponent} from './dynamic-form-builder.component';
import {FieldBuilderComponent} from './field-builder/field-builder.component';
import {TextBoxComponent} from './atoms/textbox';

@NgModule({
	imports: [
		BrowserModule,
		FormsModule,
		ReactiveFormsModule,
		MatAutocompleteModule,
		MatCheckboxModule,
		MatFormFieldModule,
		MatInputModule,
		MatRadioModule,
		MatSelectModule,
		MatSliderModule,
		MatTabsModule,
		MatButtonToggleModule,
		MatExpansionModule,
		ReactiveFormsModule,
		TextMaskModule,
		FontAwesomeModule
	],
	declarations: [
		DynamicFormBuilderComponent,
		FieldBuilderComponent,
		TextBoxComponent
	],
	exports: [DynamicFormBuilderComponent],
	providers: []
})
export class DynamicFormBuilderModule {

}
