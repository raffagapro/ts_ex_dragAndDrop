namespace App{
    export const Autobind = (_:any, _2:string, descriptor:PropertyDescriptor) =>{
        const originalMethod = descriptor.value;
        const modDescriptor:PropertyDescriptor = {
            configurable: true,
            enumerable: false,
            get(){
                const boundFn = originalMethod.bind(this);
                return boundFn;
            }
        }
        return modDescriptor;
    }
}