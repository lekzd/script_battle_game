
const instances = new Map<Function, any>();

function tryToInstantiateClassForTarget(classLocator: any, targetName: string) {
    if (!instances.has(classLocator)) {
        try {
            instances.set(classLocator, new classLocator());
        } catch(e) {
            console.error(`Failed to instantiate class ${classLocator} for target ${targetName}`);
            throw e;
        }
    }
}

export function Inject(classLocator: any) {
    return function(target: any, name: string, descriptor?: PropertyDescriptor) {
        if (!name) {
            throw new Error('@Inject() shoud be applied to class attribute only');
        }

        tryToInstantiateClassForTarget(classLocator, target.name);

        Object.defineProperty(target, name, {
            get: () => instances.get(classLocator)
        })
        
    }
}

export const setInject = (classLocator: any, value: any) => {
    instances.set(classLocator, value);
};

export const inject = <T>(classLocator: any): T => {
    tryToInstantiateClassForTarget(classLocator, 'static');

    return instances.get(classLocator);
};