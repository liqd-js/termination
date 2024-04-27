const HANDLERS = Symbol('HANDLERS');
const TERMINATE = Symbol('TERMINATE');

process.on( 'SIGTERM',  () => TerminationSignal[TERMINATE]( 'SIGTERM' ));
process.on( 'SIGINT',   () => TerminationSignal[TERMINATE]( 'SIGINT' ));

type TerminationHandler = ( signal: 'SIGTERM' | 'SIGINT' | 'MANUAL' ) => Promise<boolean | undefined | void> | boolean | undefined | void;

export default class TerminationSignal
{
    private static [HANDLERS]: Array<{ handler: TerminationHandler, priority: number }> = [];

    public static on( handler: TerminationHandler, priority: number = 0 )
    {
        const index = this[HANDLERS].findIndex( h => h.priority < priority );

        TerminationSignal[HANDLERS].splice( index === -1 ? TerminationSignal[HANDLERS].length : index, 0, { handler, priority });
    }

    public static off( handler: TerminationHandler )
    {
        const index = this[HANDLERS].findIndex( h => h.handler === handler );

        index !== -1 && TerminationSignal[HANDLERS].splice( index, 1 );
    }

    private static async[TERMINATE]( signal: 'SIGTERM' | 'SIGINT' | 'MANUAL' )
    {
        for( let handler of TerminationSignal[HANDLERS] )
        {
            if( await handler.handler( signal ) === false )
            {
                return false;
            }
        }

        process.exit( 0 );
    }

    public static async terminate( signal: 'MANUAL' )
    {
        return TerminationSignal[TERMINATE]( signal );
    }
}