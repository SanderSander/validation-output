# Validation Output
![NPM Version](https://img.shields.io/npm/v/validation-output)

A web component for custom client-side form validation. Replaces the browser's default validation UI with your own styled messages. 
Gives you control over how validation feedback is displayed to users and keeps it consistent across your application.

[View live demo](https://sandersander.github.io/validation-output/demo.html)

## Installation

### Package manager

Install using your package manager of choice:

```shell
npm install validation-output
```

Then import the component in your project:

```js
import 'validation-output';
```

### CDN

You can also load the component via CDN:

```html
<script type="module" src="https://cdn.jsdelivr.net/npm/validation-output@latest/validation-output.min.js"></script>
```

## Usage

### Basic Client-Side Validation

Use the `for` attribute to associate the validation output with an input element. 
This allows you to control the placement and styling of validation messages.

```html
<input type="email" id="email" />
<validation-output for="email"></validation-output>
```

### Custom Validation Messages

Display custom messages for specific validation errors using a `<template>` with `data-validity` attributes. 
The attribute value must match a property from the 
[ValidityState API](https://developer.mozilla.org/en-US/docs/Web/API/ValidityState).


```html
<template id="validation-messages">
    <template data-validity="typeMismatch">
        This is not looking right
    </template>
    <template data-validity="valueMissing">
        I expect an <b>email</b>, <i>darling!</i>
    </template>
</template>

<input type="email" id="email" required />
<validation-output for="email" template="validation-messages"></validation-output>
<input type="number" id="number" required />
<validation-output for="number" template="validation-messages"></validation-output>
```

### Server-Side Validation

Add text content to the `<validation-output>` element to display server-side validation errors:

```html
<input type="email" id="email" value="known@email" />
<validation-output for="email">
    Invalid credentials. Please try again.
</validation-output>

<input type="text" id="persistent" value="rejected-value" />
<validation-output for="persistent" persistent>
    This error will be show again if the value is changed back to the rejected value
</validation-output>
```

When the user modifies the input field, the server-side message is hidden.
If the `persistent` attribute is set and the user changes the value back to the rejected value, the message will be shown again.

**Note:** When displaying server-side validation errors, the input element won't have the `:user-invalid` pseudo-class applied. 
To style server-validated inputs, you can use the `data-server-invalid="true"` attribute selector instead. 
This attribute is automatically removed once the user modifies the input, allowing you to switch to `:user-invalid` styling.

### Styling

Style the validation output using standard CSS. 
You can use the `:user-invalid`, `:invalid` on the input field for styling.

On the validation-output element, you can use the `:state(has-error)` selector to style 
the validation output when it contains an error.

```css
input:user-invalid  {
    border: 1px solid darkred;
}
validation-output {
    color: darkred;
    display: none;
}
validation-output:state(has-error) {
    display: block;
}
```

## API

### Attributes

| Attribute    | Required | Description                                                                       |
|--------------|----------|-----------------------------------------------------------------------------------|
| `for`        | Yes      | ID of the input element to validate                                               |
| `template`   | No       | ID of the template containing custom validation messages                          |
| `persistent` | No       | Show the server validation error again if the value reverts to the rejected value |
