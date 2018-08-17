export function elementHasParent(element: HTMLElement, parent: HTMLElement): boolean {
    let elementParent = element.parentNode;

    while (elementParent) {
        if (parent === elementParent) {
            return true;
        }

        elementParent = elementParent.parentNode;
    }

    return false;
}