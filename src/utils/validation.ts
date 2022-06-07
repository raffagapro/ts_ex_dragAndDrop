export interface Validatable {
    value: string | number;
    required?: boolean;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
}

export const validate = (validatableInput: Validatable) => {
    let isValid = true;
    //validation critiria
    if (validatableInput.required) {
        //if isValid is true and the value is not empty
        isValid = isValid && validatableInput.value.toString().trim().length !== 0;
    }
    if(
        validatableInput.minLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length >= validatableInput.minLength;
    }
    if(
        validatableInput.maxLength != null &&
        typeof validatableInput.value === 'string'
    ){
        isValid = isValid && validatableInput.value.length <= validatableInput.maxLength;
    }
    if(
        validatableInput.min != null &&
        typeof validatableInput.value === 'number'
    ){
        isValid = isValid && validatableInput.value >= validatableInput.min;
    }
    if(
        validatableInput.max != null &&
        typeof validatableInput.value === 'number'
    ){
        isValid = isValid && validatableInput.value <= validatableInput.max;
    }
    return isValid;
}