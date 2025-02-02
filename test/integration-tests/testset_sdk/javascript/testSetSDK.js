const iotea = require('../../../../src/module.js');
// const iotea = require('boschio.iotea');

const {
    TestSetTalent,
    ProtocolGateway
} = iotea;

const {
    Logger,
    MqttProtocolAdapter
} = iotea.util;

process.env.LOG_LEVEL = Logger.ENV_LOG_LEVEL.INFO;

class TestSetSDK extends TestSetTalent {
    constructor(protocolGatewayConfig) {
        super('testSet-sdk-js', protocolGatewayConfig);

        // Register Tests

        // Test primitives via echo
        this.registerTest('echoString', "Hello World", this.test_echoString.bind(this), 5000);
        this.registerTest('echoBoolean', true, this.test_echoBoolean.bind(this), 5000);
        this.registerTest('echoInteger', 123, this.test_echoInteger.bind(this), 5000);
        this.registerTest('echoDouble', 123.456, this.test_echoDouble.bind(this), 5000);

        // Test lists/arrays via echo
        this.registerTest('echoEmptyList', [ ], this.test_echoEmptyList.bind(this), 5000);
        this.registerTest('echoIntegerList', [ 1, 2, 3 ], this.test_echoIntegerList.bind(this), 5000);
        this.registerTest('echoMixedList', [1, 'Hello World', 3.21], this.test_echoMixedList.bind(this), 5000);
        this.registerTest('echoDeepList', [1, [2, [3, [4, [5]]]]], this.test_echoDeepList.bind(this), 5000);

        // Add external talentIds which this test set is depending on
        this.talentDependencies.addTalent('function-provider-js');
    }

    callees() {
        return [ 'function-provider-js.echo' ];
    }

    async test_echoString(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ 'Hello World' ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoBoolean(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ true ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoInteger(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ 123 ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoDouble(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ 123.456 ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoEmptyList(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ [] ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoIntegerList(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ [1, 2, 3] ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoMixedList(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ [1, 'Hello World', 3.21] ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async test_echoDeepList(ev, evtctx) {
        let result = await this.call('function-provider-js','echo',
                                [ [1, [2, [3, [4, [5]]]]] ],
                                ev.subject,
                                ev.returnTopic,
                                500);

        return result;
    }

    async prepare(ev, evctx) {
        // Add additional preperation beside talent which have been already defined as dependency
        // (see this.talentDependencies)
        return (true && await super.prepare(ev, evctx));
    }
}

const tss = new TestSetSDK(ProtocolGateway.createDefaultConfiguration([ MqttProtocolAdapter.createDefaultConfiguration() ]));

tss.start();
