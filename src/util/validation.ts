export interface Validateable {
    value: string | number;
    required?: boolean;
    // Length of the input string
    minLength?: number;
    maxLength?: number;
    // For numbers, actual min/max value
    min?: number;
    max?: number;
}

export function validate(validateable: Validateable): boolean {
    let isValid = true;
    if (validateable.required) {
       isValid = isValid && validateable.value.toString().trim().length !== 0;
    }
    if (validateable.minLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length > validateable.minLength;
    }
    if (validateable.maxLength != null && typeof validateable.value === 'string') {
        isValid = isValid && validateable.value.length < validateable.maxLength;
    }
    if (validateable.min != null && typeof validateable.value === 'number' ) {
        isValid = isValid && validateable.value > validateable.min;
    }
    if (validateable.max != null && typeof validateable.value === 'number' ) {
        isValid = isValid && validateable.value < validateable.max;
    }
    return isValid;
}