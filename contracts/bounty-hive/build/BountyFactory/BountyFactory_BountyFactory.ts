import {
    Cell,
    Slice,
    Address,
    Builder,
    beginCell,
    ComputeError,
    TupleItem,
    TupleReader,
    Dictionary,
    contractAddress,
    address,
    ContractProvider,
    Sender,
    Contract,
    ContractABI,
    ABIType,
    ABIGetter,
    ABIReceiver,
    TupleBuilder,
    DictionaryValue
} from '@ton/core';

export type DataSize = {
    $$type: 'DataSize';
    cells: bigint;
    bits: bigint;
    refs: bigint;
}

export function storeDataSize(src: DataSize) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.cells, 257);
        b_0.storeInt(src.bits, 257);
        b_0.storeInt(src.refs, 257);
    };
}

export function loadDataSize(slice: Slice) {
    const sc_0 = slice;
    const _cells = sc_0.loadIntBig(257);
    const _bits = sc_0.loadIntBig(257);
    const _refs = sc_0.loadIntBig(257);
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function loadGetterTupleDataSize(source: TupleReader) {
    const _cells = source.readBigNumber();
    const _bits = source.readBigNumber();
    const _refs = source.readBigNumber();
    return { $$type: 'DataSize' as const, cells: _cells, bits: _bits, refs: _refs };
}

export function storeTupleDataSize(source: DataSize) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.cells);
    builder.writeNumber(source.bits);
    builder.writeNumber(source.refs);
    return builder.build();
}

export function dictValueParserDataSize(): DictionaryValue<DataSize> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDataSize(src)).endCell());
        },
        parse: (src) => {
            return loadDataSize(src.loadRef().beginParse());
        }
    }
}

export type SignedBundle = {
    $$type: 'SignedBundle';
    signature: Buffer;
    signedData: Slice;
}

export function storeSignedBundle(src: SignedBundle) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBuffer(src.signature);
        b_0.storeBuilder(src.signedData.asBuilder());
    };
}

export function loadSignedBundle(slice: Slice) {
    const sc_0 = slice;
    const _signature = sc_0.loadBuffer(64);
    const _signedData = sc_0;
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function loadGetterTupleSignedBundle(source: TupleReader) {
    const _signature = source.readBuffer();
    const _signedData = source.readCell().asSlice();
    return { $$type: 'SignedBundle' as const, signature: _signature, signedData: _signedData };
}

export function storeTupleSignedBundle(source: SignedBundle) {
    const builder = new TupleBuilder();
    builder.writeBuffer(source.signature);
    builder.writeSlice(source.signedData.asCell());
    return builder.build();
}

export function dictValueParserSignedBundle(): DictionaryValue<SignedBundle> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSignedBundle(src)).endCell());
        },
        parse: (src) => {
            return loadSignedBundle(src.loadRef().beginParse());
        }
    }
}

export type StateInit = {
    $$type: 'StateInit';
    code: Cell;
    data: Cell;
}

export function storeStateInit(src: StateInit) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeRef(src.code);
        b_0.storeRef(src.data);
    };
}

export function loadStateInit(slice: Slice) {
    const sc_0 = slice;
    const _code = sc_0.loadRef();
    const _data = sc_0.loadRef();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function loadGetterTupleStateInit(source: TupleReader) {
    const _code = source.readCell();
    const _data = source.readCell();
    return { $$type: 'StateInit' as const, code: _code, data: _data };
}

export function storeTupleStateInit(source: StateInit) {
    const builder = new TupleBuilder();
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    return builder.build();
}

export function dictValueParserStateInit(): DictionaryValue<StateInit> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStateInit(src)).endCell());
        },
        parse: (src) => {
            return loadStateInit(src.loadRef().beginParse());
        }
    }
}

export type Context = {
    $$type: 'Context';
    bounceable: boolean;
    sender: Address;
    value: bigint;
    raw: Slice;
}

export function storeContext(src: Context) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeBit(src.bounceable);
        b_0.storeAddress(src.sender);
        b_0.storeInt(src.value, 257);
        b_0.storeRef(src.raw.asCell());
    };
}

export function loadContext(slice: Slice) {
    const sc_0 = slice;
    const _bounceable = sc_0.loadBit();
    const _sender = sc_0.loadAddress();
    const _value = sc_0.loadIntBig(257);
    const _raw = sc_0.loadRef().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function loadGetterTupleContext(source: TupleReader) {
    const _bounceable = source.readBoolean();
    const _sender = source.readAddress();
    const _value = source.readBigNumber();
    const _raw = source.readCell().asSlice();
    return { $$type: 'Context' as const, bounceable: _bounceable, sender: _sender, value: _value, raw: _raw };
}

export function storeTupleContext(source: Context) {
    const builder = new TupleBuilder();
    builder.writeBoolean(source.bounceable);
    builder.writeAddress(source.sender);
    builder.writeNumber(source.value);
    builder.writeSlice(source.raw.asCell());
    return builder.build();
}

export function dictValueParserContext(): DictionaryValue<Context> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeContext(src)).endCell());
        },
        parse: (src) => {
            return loadContext(src.loadRef().beginParse());
        }
    }
}

export type SendParameters = {
    $$type: 'SendParameters';
    mode: bigint;
    body: Cell | null;
    code: Cell | null;
    data: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeSendParameters(src: SendParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        if (src.code !== null && src.code !== undefined) { b_0.storeBit(true).storeRef(src.code); } else { b_0.storeBit(false); }
        if (src.data !== null && src.data !== undefined) { b_0.storeBit(true).storeRef(src.data); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadSendParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _code = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _data = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleSendParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _code = source.readCellOpt();
    const _data = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'SendParameters' as const, mode: _mode, body: _body, code: _code, data: _data, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleSendParameters(source: SendParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeCell(source.code);
    builder.writeCell(source.data);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserSendParameters(): DictionaryValue<SendParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSendParameters(src)).endCell());
        },
        parse: (src) => {
            return loadSendParameters(src.loadRef().beginParse());
        }
    }
}

export type MessageParameters = {
    $$type: 'MessageParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    to: Address;
    bounce: boolean;
}

export function storeMessageParameters(src: MessageParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeAddress(src.to);
        b_0.storeBit(src.bounce);
    };
}

export function loadMessageParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _to = sc_0.loadAddress();
    const _bounce = sc_0.loadBit();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function loadGetterTupleMessageParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _to = source.readAddress();
    const _bounce = source.readBoolean();
    return { $$type: 'MessageParameters' as const, mode: _mode, body: _body, value: _value, to: _to, bounce: _bounce };
}

export function storeTupleMessageParameters(source: MessageParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeAddress(source.to);
    builder.writeBoolean(source.bounce);
    return builder.build();
}

export function dictValueParserMessageParameters(): DictionaryValue<MessageParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeMessageParameters(src)).endCell());
        },
        parse: (src) => {
            return loadMessageParameters(src.loadRef().beginParse());
        }
    }
}

export type DeployParameters = {
    $$type: 'DeployParameters';
    mode: bigint;
    body: Cell | null;
    value: bigint;
    bounce: boolean;
    init: StateInit;
}

export function storeDeployParameters(src: DeployParameters) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.mode, 257);
        if (src.body !== null && src.body !== undefined) { b_0.storeBit(true).storeRef(src.body); } else { b_0.storeBit(false); }
        b_0.storeInt(src.value, 257);
        b_0.storeBit(src.bounce);
        b_0.store(storeStateInit(src.init));
    };
}

export function loadDeployParameters(slice: Slice) {
    const sc_0 = slice;
    const _mode = sc_0.loadIntBig(257);
    const _body = sc_0.loadBit() ? sc_0.loadRef() : null;
    const _value = sc_0.loadIntBig(257);
    const _bounce = sc_0.loadBit();
    const _init = loadStateInit(sc_0);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function loadGetterTupleDeployParameters(source: TupleReader) {
    const _mode = source.readBigNumber();
    const _body = source.readCellOpt();
    const _value = source.readBigNumber();
    const _bounce = source.readBoolean();
    const _init = loadGetterTupleStateInit(source);
    return { $$type: 'DeployParameters' as const, mode: _mode, body: _body, value: _value, bounce: _bounce, init: _init };
}

export function storeTupleDeployParameters(source: DeployParameters) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.mode);
    builder.writeCell(source.body);
    builder.writeNumber(source.value);
    builder.writeBoolean(source.bounce);
    builder.writeTuple(storeTupleStateInit(source.init));
    return builder.build();
}

export function dictValueParserDeployParameters(): DictionaryValue<DeployParameters> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeDeployParameters(src)).endCell());
        },
        parse: (src) => {
            return loadDeployParameters(src.loadRef().beginParse());
        }
    }
}

export type StdAddress = {
    $$type: 'StdAddress';
    workchain: bigint;
    address: bigint;
}

export function storeStdAddress(src: StdAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 8);
        b_0.storeUint(src.address, 256);
    };
}

export function loadStdAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(8);
    const _address = sc_0.loadUintBig(256);
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleStdAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readBigNumber();
    return { $$type: 'StdAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleStdAddress(source: StdAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeNumber(source.address);
    return builder.build();
}

export function dictValueParserStdAddress(): DictionaryValue<StdAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeStdAddress(src)).endCell());
        },
        parse: (src) => {
            return loadStdAddress(src.loadRef().beginParse());
        }
    }
}

export type VarAddress = {
    $$type: 'VarAddress';
    workchain: bigint;
    address: Slice;
}

export function storeVarAddress(src: VarAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.workchain, 32);
        b_0.storeRef(src.address.asCell());
    };
}

export function loadVarAddress(slice: Slice) {
    const sc_0 = slice;
    const _workchain = sc_0.loadIntBig(32);
    const _address = sc_0.loadRef().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function loadGetterTupleVarAddress(source: TupleReader) {
    const _workchain = source.readBigNumber();
    const _address = source.readCell().asSlice();
    return { $$type: 'VarAddress' as const, workchain: _workchain, address: _address };
}

export function storeTupleVarAddress(source: VarAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.workchain);
    builder.writeSlice(source.address.asCell());
    return builder.build();
}

export function dictValueParserVarAddress(): DictionaryValue<VarAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeVarAddress(src)).endCell());
        },
        parse: (src) => {
            return loadVarAddress(src.loadRef().beginParse());
        }
    }
}

export type BasechainAddress = {
    $$type: 'BasechainAddress';
    hash: bigint | null;
}

export function storeBasechainAddress(src: BasechainAddress) {
    return (builder: Builder) => {
        const b_0 = builder;
        if (src.hash !== null && src.hash !== undefined) { b_0.storeBit(true).storeInt(src.hash, 257); } else { b_0.storeBit(false); }
    };
}

export function loadBasechainAddress(slice: Slice) {
    const sc_0 = slice;
    const _hash = sc_0.loadBit() ? sc_0.loadIntBig(257) : null;
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function loadGetterTupleBasechainAddress(source: TupleReader) {
    const _hash = source.readBigNumberOpt();
    return { $$type: 'BasechainAddress' as const, hash: _hash };
}

export function storeTupleBasechainAddress(source: BasechainAddress) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.hash);
    return builder.build();
}

export function dictValueParserBasechainAddress(): DictionaryValue<BasechainAddress> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBasechainAddress(src)).endCell());
        },
        parse: (src) => {
            return loadBasechainAddress(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwner = {
    $$type: 'ChangeOwner';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwner(src: ChangeOwner) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2174598809, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwner(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2174598809) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwner(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwner' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwner(source: ChangeOwner) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwner(): DictionaryValue<ChangeOwner> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwner(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwner(src.loadRef().beginParse());
        }
    }
}

export type ChangeOwnerOk = {
    $$type: 'ChangeOwnerOk';
    queryId: bigint;
    newOwner: Address;
}

export function storeChangeOwnerOk(src: ChangeOwnerOk) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(846932810, 32);
        b_0.storeUint(src.queryId, 64);
        b_0.storeAddress(src.newOwner);
    };
}

export function loadChangeOwnerOk(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 846932810) { throw Error('Invalid prefix'); }
    const _queryId = sc_0.loadUintBig(64);
    const _newOwner = sc_0.loadAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function loadGetterTupleChangeOwnerOk(source: TupleReader) {
    const _queryId = source.readBigNumber();
    const _newOwner = source.readAddress();
    return { $$type: 'ChangeOwnerOk' as const, queryId: _queryId, newOwner: _newOwner };
}

export function storeTupleChangeOwnerOk(source: ChangeOwnerOk) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.queryId);
    builder.writeAddress(source.newOwner);
    return builder.build();
}

export function dictValueParserChangeOwnerOk(): DictionaryValue<ChangeOwnerOk> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeChangeOwnerOk(src)).endCell());
        },
        parse: (src) => {
            return loadChangeOwnerOk(src.loadRef().beginParse());
        }
    }
}

export type SubmitProof = {
    $$type: 'SubmitProof';
    proofUrl: string;
}

export function storeSubmitProof(src: SubmitProof) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(339648954, 32);
        b_0.storeStringRefTail(src.proofUrl);
    };
}

export function loadSubmitProof(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 339648954) { throw Error('Invalid prefix'); }
    const _proofUrl = sc_0.loadStringRefTail();
    return { $$type: 'SubmitProof' as const, proofUrl: _proofUrl };
}

export function loadTupleSubmitProof(source: TupleReader) {
    const _proofUrl = source.readString();
    return { $$type: 'SubmitProof' as const, proofUrl: _proofUrl };
}

export function loadGetterTupleSubmitProof(source: TupleReader) {
    const _proofUrl = source.readString();
    return { $$type: 'SubmitProof' as const, proofUrl: _proofUrl };
}

export function storeTupleSubmitProof(source: SubmitProof) {
    const builder = new TupleBuilder();
    builder.writeString(source.proofUrl);
    return builder.build();
}

export function dictValueParserSubmitProof(): DictionaryValue<SubmitProof> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSubmitProof(src)).endCell());
        },
        parse: (src) => {
            return loadSubmitProof(src.loadRef().beginParse());
        }
    }
}

export type ApproveSubmission = {
    $$type: 'ApproveSubmission';
    submissionId: bigint;
}

export function storeApproveSubmission(src: ApproveSubmission) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1750743222, 32);
        b_0.storeInt(src.submissionId, 257);
    };
}

export function loadApproveSubmission(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1750743222) { throw Error('Invalid prefix'); }
    const _submissionId = sc_0.loadIntBig(257);
    return { $$type: 'ApproveSubmission' as const, submissionId: _submissionId };
}

export function loadTupleApproveSubmission(source: TupleReader) {
    const _submissionId = source.readBigNumber();
    return { $$type: 'ApproveSubmission' as const, submissionId: _submissionId };
}

export function loadGetterTupleApproveSubmission(source: TupleReader) {
    const _submissionId = source.readBigNumber();
    return { $$type: 'ApproveSubmission' as const, submissionId: _submissionId };
}

export function storeTupleApproveSubmission(source: ApproveSubmission) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.submissionId);
    return builder.build();
}

export function dictValueParserApproveSubmission(): DictionaryValue<ApproveSubmission> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeApproveSubmission(src)).endCell());
        },
        parse: (src) => {
            return loadApproveSubmission(src.loadRef().beginParse());
        }
    }
}

export type RejectSubmission = {
    $$type: 'RejectSubmission';
    submissionId: bigint;
}

export function storeRejectSubmission(src: RejectSubmission) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2450262874, 32);
        b_0.storeInt(src.submissionId, 257);
    };
}

export function loadRejectSubmission(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2450262874) { throw Error('Invalid prefix'); }
    const _submissionId = sc_0.loadIntBig(257);
    return { $$type: 'RejectSubmission' as const, submissionId: _submissionId };
}

export function loadTupleRejectSubmission(source: TupleReader) {
    const _submissionId = source.readBigNumber();
    return { $$type: 'RejectSubmission' as const, submissionId: _submissionId };
}

export function loadGetterTupleRejectSubmission(source: TupleReader) {
    const _submissionId = source.readBigNumber();
    return { $$type: 'RejectSubmission' as const, submissionId: _submissionId };
}

export function storeTupleRejectSubmission(source: RejectSubmission) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.submissionId);
    return builder.build();
}

export function dictValueParserRejectSubmission(): DictionaryValue<RejectSubmission> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeRejectSubmission(src)).endCell());
        },
        parse: (src) => {
            return loadRejectSubmission(src.loadRef().beginParse());
        }
    }
}

export type SelectWinners = {
    $$type: 'SelectWinners';
    count: bigint;
    winnerIds: Dictionary<bigint, Address>;
}

export function storeSelectWinners(src: SelectWinners) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(3480222973, 32);
        b_0.storeInt(src.count, 257);
        b_0.storeDict(src.winnerIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
    };
}

export function loadSelectWinners(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 3480222973) { throw Error('Invalid prefix'); }
    const _count = sc_0.loadIntBig(257);
    const _winnerIds = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_0);
    return { $$type: 'SelectWinners' as const, count: _count, winnerIds: _winnerIds };
}

export function loadTupleSelectWinners(source: TupleReader) {
    const _count = source.readBigNumber();
    const _winnerIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    return { $$type: 'SelectWinners' as const, count: _count, winnerIds: _winnerIds };
}

export function loadGetterTupleSelectWinners(source: TupleReader) {
    const _count = source.readBigNumber();
    const _winnerIds = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    return { $$type: 'SelectWinners' as const, count: _count, winnerIds: _winnerIds };
}

export function storeTupleSelectWinners(source: SelectWinners) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.count);
    builder.writeCell(source.winnerIds.size > 0 ? beginCell().storeDictDirect(source.winnerIds, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    return builder.build();
}

export function dictValueParserSelectWinners(): DictionaryValue<SelectWinners> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSelectWinners(src)).endCell());
        },
        parse: (src) => {
            return loadSelectWinners(src.loadRef().beginParse());
        }
    }
}

export type CancelBounty = {
    $$type: 'CancelBounty';
}

export function storeCancelBounty(src: CancelBounty) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(111578025, 32);
    };
}

export function loadCancelBounty(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 111578025) { throw Error('Invalid prefix'); }
    return { $$type: 'CancelBounty' as const };
}

export function loadTupleCancelBounty(source: TupleReader) {
    return { $$type: 'CancelBounty' as const };
}

export function loadGetterTupleCancelBounty(source: TupleReader) {
    return { $$type: 'CancelBounty' as const };
}

export function storeTupleCancelBounty(source: CancelBounty) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserCancelBounty(): DictionaryValue<CancelBounty> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCancelBounty(src)).endCell());
        },
        parse: (src) => {
            return loadCancelBounty(src.loadRef().beginParse());
        }
    }
}

export type WithdrawExcess = {
    $$type: 'WithdrawExcess';
}

export function storeWithdrawExcess(src: WithdrawExcess) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(1401221694, 32);
    };
}

export function loadWithdrawExcess(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 1401221694) { throw Error('Invalid prefix'); }
    return { $$type: 'WithdrawExcess' as const };
}

export function loadTupleWithdrawExcess(source: TupleReader) {
    return { $$type: 'WithdrawExcess' as const };
}

export function loadGetterTupleWithdrawExcess(source: TupleReader) {
    return { $$type: 'WithdrawExcess' as const };
}

export function storeTupleWithdrawExcess(source: WithdrawExcess) {
    const builder = new TupleBuilder();
    return builder.build();
}

export function dictValueParserWithdrawExcess(): DictionaryValue<WithdrawExcess> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeWithdrawExcess(src)).endCell());
        },
        parse: (src) => {
            return loadWithdrawExcess(src.loadRef().beginParse());
        }
    }
}

export type Submission = {
    $$type: 'Submission';
    id: bigint;
    submitter: Address;
    proofUrl: string;
    submittedAt: bigint;
    approved: boolean;
}

export function storeSubmission(src: Submission) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.id, 257);
        b_0.storeAddress(src.submitter);
        b_0.storeStringRefTail(src.proofUrl);
        b_0.storeInt(src.submittedAt, 257);
        b_0.storeBit(src.approved);
    };
}

export function loadSubmission(slice: Slice) {
    const sc_0 = slice;
    const _id = sc_0.loadIntBig(257);
    const _submitter = sc_0.loadAddress();
    const _proofUrl = sc_0.loadStringRefTail();
    const _submittedAt = sc_0.loadIntBig(257);
    const _approved = sc_0.loadBit();
    return { $$type: 'Submission' as const, id: _id, submitter: _submitter, proofUrl: _proofUrl, submittedAt: _submittedAt, approved: _approved };
}

export function loadTupleSubmission(source: TupleReader) {
    const _id = source.readBigNumber();
    const _submitter = source.readAddress();
    const _proofUrl = source.readString();
    const _submittedAt = source.readBigNumber();
    const _approved = source.readBoolean();
    return { $$type: 'Submission' as const, id: _id, submitter: _submitter, proofUrl: _proofUrl, submittedAt: _submittedAt, approved: _approved };
}

export function loadGetterTupleSubmission(source: TupleReader) {
    const _id = source.readBigNumber();
    const _submitter = source.readAddress();
    const _proofUrl = source.readString();
    const _submittedAt = source.readBigNumber();
    const _approved = source.readBoolean();
    return { $$type: 'Submission' as const, id: _id, submitter: _submitter, proofUrl: _proofUrl, submittedAt: _submittedAt, approved: _approved };
}

export function storeTupleSubmission(source: Submission) {
    const builder = new TupleBuilder();
    builder.writeNumber(source.id);
    builder.writeAddress(source.submitter);
    builder.writeString(source.proofUrl);
    builder.writeNumber(source.submittedAt);
    builder.writeBoolean(source.approved);
    return builder.build();
}

export function dictValueParserSubmission(): DictionaryValue<Submission> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeSubmission(src)).endCell());
        },
        parse: (src) => {
            return loadSubmission(src.loadRef().beginParse());
        }
    }
}

export type BountyEscrow$Data = {
    $$type: 'BountyEscrow$Data';
    owner: Address;
    title: string;
    description: string;
    bountyType: string;
    poolAmount: bigint;
    winnerCount: bigint;
    perWinnerAmount: bigint;
    platformFeeBps: bigint;
    platformAddress: Address;
    winnerSelection: string;
    verification: string;
    verificationRule: string;
    createdAt: bigint;
    durationSeconds: bigint;
    reviewWindowSeconds: bigint;
    endsAt: bigint;
    reviewEndsAt: bigint;
    status: string;
    submissions: Dictionary<bigint, Submission>;
    submissionCount: bigint;
    nextSubmissionId: bigint;
    winners: Dictionary<bigint, Address>;
    winnerCountFinal: bigint;
    payoutDone: boolean;
}

export function storeBountyEscrow$Data(src: BountyEscrow$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
        const b_1 = new Builder();
        b_1.storeStringRefTail(src.bountyType);
        b_1.storeInt(src.poolAmount, 257);
        b_1.storeInt(src.winnerCount, 257);
        b_1.storeInt(src.perWinnerAmount, 257);
        const b_2 = new Builder();
        b_2.storeInt(src.platformFeeBps, 257);
        b_2.storeAddress(src.platformAddress);
        b_2.storeStringRefTail(src.winnerSelection);
        b_2.storeStringRefTail(src.verification);
        b_2.storeStringRefTail(src.verificationRule);
        b_2.storeInt(src.createdAt, 257);
        const b_3 = new Builder();
        b_3.storeInt(src.durationSeconds, 257);
        b_3.storeInt(src.reviewWindowSeconds, 257);
        b_3.storeInt(src.endsAt, 257);
        const b_4 = new Builder();
        b_4.storeInt(src.reviewEndsAt, 257);
        b_4.storeStringRefTail(src.status);
        b_4.storeDict(src.submissions, Dictionary.Keys.BigInt(257), dictValueParserSubmission());
        b_4.storeInt(src.submissionCount, 257);
        b_4.storeInt(src.nextSubmissionId, 257);
        b_4.storeDict(src.winners, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        const b_5 = new Builder();
        b_5.storeInt(src.winnerCountFinal, 257);
        b_5.storeBit(src.payoutDone);
        b_4.storeRef(b_5.endCell());
        b_3.storeRef(b_4.endCell());
        b_2.storeRef(b_3.endCell());
        b_1.storeRef(b_2.endCell());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadBountyEscrow$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    const sc_1 = sc_0.loadRef().beginParse();
    const _bountyType = sc_1.loadStringRefTail();
    const _poolAmount = sc_1.loadIntBig(257);
    const _winnerCount = sc_1.loadIntBig(257);
    const _perWinnerAmount = sc_1.loadIntBig(257);
    const sc_2 = sc_1.loadRef().beginParse();
    const _platformFeeBps = sc_2.loadIntBig(257);
    const _platformAddress = sc_2.loadAddress();
    const _winnerSelection = sc_2.loadStringRefTail();
    const _verification = sc_2.loadStringRefTail();
    const _verificationRule = sc_2.loadStringRefTail();
    const _createdAt = sc_2.loadIntBig(257);
    const sc_3 = sc_2.loadRef().beginParse();
    const _durationSeconds = sc_3.loadIntBig(257);
    const _reviewWindowSeconds = sc_3.loadIntBig(257);
    const _endsAt = sc_3.loadIntBig(257);
    const sc_4 = sc_3.loadRef().beginParse();
    const _reviewEndsAt = sc_4.loadIntBig(257);
    const _status = sc_4.loadStringRefTail();
    const _submissions = Dictionary.load(Dictionary.Keys.BigInt(257), dictValueParserSubmission(), sc_4);
    const _submissionCount = sc_4.loadIntBig(257);
    const _nextSubmissionId = sc_4.loadIntBig(257);
    const _winners = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_4);
    const sc_5 = sc_4.loadRef().beginParse();
    const _winnerCountFinal = sc_5.loadIntBig(257);
    const _payoutDone = sc_5.loadBit();
    return { $$type: 'BountyEscrow$Data' as const, owner: _owner, title: _title, description: _description, bountyType: _bountyType, poolAmount: _poolAmount, winnerCount: _winnerCount, perWinnerAmount: _perWinnerAmount, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule, createdAt: _createdAt, durationSeconds: _durationSeconds, reviewWindowSeconds: _reviewWindowSeconds, endsAt: _endsAt, reviewEndsAt: _reviewEndsAt, status: _status, submissions: _submissions, submissionCount: _submissionCount, nextSubmissionId: _nextSubmissionId, winners: _winners, winnerCountFinal: _winnerCountFinal, payoutDone: _payoutDone };
}

export function loadTupleBountyEscrow$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    const _bountyType = source.readString();
    const _poolAmount = source.readBigNumber();
    const _winnerCount = source.readBigNumber();
    const _perWinnerAmount = source.readBigNumber();
    const _platformFeeBps = source.readBigNumber();
    const _platformAddress = source.readAddress();
    const _winnerSelection = source.readString();
    const _verification = source.readString();
    const _verificationRule = source.readString();
    const _createdAt = source.readBigNumber();
    const _durationSeconds = source.readBigNumber();
    source = source.readTuple();
    const _reviewWindowSeconds = source.readBigNumber();
    const _endsAt = source.readBigNumber();
    const _reviewEndsAt = source.readBigNumber();
    const _status = source.readString();
    const _submissions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserSubmission(), source.readCellOpt());
    const _submissionCount = source.readBigNumber();
    const _nextSubmissionId = source.readBigNumber();
    const _winners = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _winnerCountFinal = source.readBigNumber();
    const _payoutDone = source.readBoolean();
    return { $$type: 'BountyEscrow$Data' as const, owner: _owner, title: _title, description: _description, bountyType: _bountyType, poolAmount: _poolAmount, winnerCount: _winnerCount, perWinnerAmount: _perWinnerAmount, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule, createdAt: _createdAt, durationSeconds: _durationSeconds, reviewWindowSeconds: _reviewWindowSeconds, endsAt: _endsAt, reviewEndsAt: _reviewEndsAt, status: _status, submissions: _submissions, submissionCount: _submissionCount, nextSubmissionId: _nextSubmissionId, winners: _winners, winnerCountFinal: _winnerCountFinal, payoutDone: _payoutDone };
}

export function loadGetterTupleBountyEscrow$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _title = source.readString();
    const _description = source.readString();
    const _bountyType = source.readString();
    const _poolAmount = source.readBigNumber();
    const _winnerCount = source.readBigNumber();
    const _perWinnerAmount = source.readBigNumber();
    const _platformFeeBps = source.readBigNumber();
    const _platformAddress = source.readAddress();
    const _winnerSelection = source.readString();
    const _verification = source.readString();
    const _verificationRule = source.readString();
    const _createdAt = source.readBigNumber();
    const _durationSeconds = source.readBigNumber();
    const _reviewWindowSeconds = source.readBigNumber();
    const _endsAt = source.readBigNumber();
    const _reviewEndsAt = source.readBigNumber();
    const _status = source.readString();
    const _submissions = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), dictValueParserSubmission(), source.readCellOpt());
    const _submissionCount = source.readBigNumber();
    const _nextSubmissionId = source.readBigNumber();
    const _winners = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    const _winnerCountFinal = source.readBigNumber();
    const _payoutDone = source.readBoolean();
    return { $$type: 'BountyEscrow$Data' as const, owner: _owner, title: _title, description: _description, bountyType: _bountyType, poolAmount: _poolAmount, winnerCount: _winnerCount, perWinnerAmount: _perWinnerAmount, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule, createdAt: _createdAt, durationSeconds: _durationSeconds, reviewWindowSeconds: _reviewWindowSeconds, endsAt: _endsAt, reviewEndsAt: _reviewEndsAt, status: _status, submissions: _submissions, submissionCount: _submissionCount, nextSubmissionId: _nextSubmissionId, winners: _winners, winnerCountFinal: _winnerCountFinal, payoutDone: _payoutDone };
}

export function storeTupleBountyEscrow$Data(source: BountyEscrow$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeString(source.title);
    builder.writeString(source.description);
    builder.writeString(source.bountyType);
    builder.writeNumber(source.poolAmount);
    builder.writeNumber(source.winnerCount);
    builder.writeNumber(source.perWinnerAmount);
    builder.writeNumber(source.platformFeeBps);
    builder.writeAddress(source.platformAddress);
    builder.writeString(source.winnerSelection);
    builder.writeString(source.verification);
    builder.writeString(source.verificationRule);
    builder.writeNumber(source.createdAt);
    builder.writeNumber(source.durationSeconds);
    builder.writeNumber(source.reviewWindowSeconds);
    builder.writeNumber(source.endsAt);
    builder.writeNumber(source.reviewEndsAt);
    builder.writeString(source.status);
    builder.writeCell(source.submissions.size > 0 ? beginCell().storeDictDirect(source.submissions, Dictionary.Keys.BigInt(257), dictValueParserSubmission()).endCell() : null);
    builder.writeNumber(source.submissionCount);
    builder.writeNumber(source.nextSubmissionId);
    builder.writeCell(source.winners.size > 0 ? beginCell().storeDictDirect(source.winners, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    builder.writeNumber(source.winnerCountFinal);
    builder.writeBoolean(source.payoutDone);
    return builder.build();
}

export function dictValueParserBountyEscrow$Data(): DictionaryValue<BountyEscrow$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBountyEscrow$Data(src)).endCell());
        },
        parse: (src) => {
            return loadBountyEscrow$Data(src.loadRef().beginParse());
        }
    }
}

export type CreateBounty = {
    $$type: 'CreateBounty';
    title: string;
    description: string;
    bountyType: string;
    winnerCount: bigint;
    winnerSelection: string;
    verification: string;
    verificationRule: string;
}

export function storeCreateBounty(src: CreateBounty) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeUint(2510301030, 32);
        b_0.storeStringRefTail(src.title);
        b_0.storeStringRefTail(src.description);
        const b_1 = new Builder();
        b_1.storeStringRefTail(src.bountyType);
        b_1.storeInt(src.winnerCount, 257);
        b_1.storeStringRefTail(src.winnerSelection);
        b_1.storeStringRefTail(src.verification);
        b_1.storeStringRefTail(src.verificationRule);
        b_0.storeRef(b_1.endCell());
    };
}

export function loadCreateBounty(slice: Slice) {
    const sc_0 = slice;
    if (sc_0.loadUint(32) !== 2510301030) { throw Error('Invalid prefix'); }
    const _title = sc_0.loadStringRefTail();
    const _description = sc_0.loadStringRefTail();
    const sc_1 = sc_0.loadRef().beginParse();
    const _bountyType = sc_1.loadStringRefTail();
    const _winnerCount = sc_1.loadIntBig(257);
    const _winnerSelection = sc_1.loadStringRefTail();
    const _verification = sc_1.loadStringRefTail();
    const _verificationRule = sc_1.loadStringRefTail();
    return { $$type: 'CreateBounty' as const, title: _title, description: _description, bountyType: _bountyType, winnerCount: _winnerCount, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule };
}

export function loadTupleCreateBounty(source: TupleReader) {
    const _title = source.readString();
    const _description = source.readString();
    const _bountyType = source.readString();
    const _winnerCount = source.readBigNumber();
    const _winnerSelection = source.readString();
    const _verification = source.readString();
    const _verificationRule = source.readString();
    return { $$type: 'CreateBounty' as const, title: _title, description: _description, bountyType: _bountyType, winnerCount: _winnerCount, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule };
}

export function loadGetterTupleCreateBounty(source: TupleReader) {
    const _title = source.readString();
    const _description = source.readString();
    const _bountyType = source.readString();
    const _winnerCount = source.readBigNumber();
    const _winnerSelection = source.readString();
    const _verification = source.readString();
    const _verificationRule = source.readString();
    return { $$type: 'CreateBounty' as const, title: _title, description: _description, bountyType: _bountyType, winnerCount: _winnerCount, winnerSelection: _winnerSelection, verification: _verification, verificationRule: _verificationRule };
}

export function storeTupleCreateBounty(source: CreateBounty) {
    const builder = new TupleBuilder();
    builder.writeString(source.title);
    builder.writeString(source.description);
    builder.writeString(source.bountyType);
    builder.writeNumber(source.winnerCount);
    builder.writeString(source.winnerSelection);
    builder.writeString(source.verification);
    builder.writeString(source.verificationRule);
    return builder.build();
}

export function dictValueParserCreateBounty(): DictionaryValue<CreateBounty> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeCreateBounty(src)).endCell());
        },
        parse: (src) => {
            return loadCreateBounty(src.loadRef().beginParse());
        }
    }
}

export type BountyFactory$Data = {
    $$type: 'BountyFactory$Data';
    owner: Address;
    platformFeeBps: bigint;
    platformAddress: Address;
    bountyCount: bigint;
    bounties: Dictionary<bigint, Address>;
}

export function storeBountyFactory$Data(src: BountyFactory$Data) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeAddress(src.owner);
        b_0.storeInt(src.platformFeeBps, 257);
        b_0.storeAddress(src.platformAddress);
        const b_1 = new Builder();
        b_1.storeInt(src.bountyCount, 257);
        b_1.storeDict(src.bounties, Dictionary.Keys.BigInt(257), Dictionary.Values.Address());
        b_0.storeRef(b_1.endCell());
    };
}

export function loadBountyFactory$Data(slice: Slice) {
    const sc_0 = slice;
    const _owner = sc_0.loadAddress();
    const _platformFeeBps = sc_0.loadIntBig(257);
    const _platformAddress = sc_0.loadAddress();
    const sc_1 = sc_0.loadRef().beginParse();
    const _bountyCount = sc_1.loadIntBig(257);
    const _bounties = Dictionary.load(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), sc_1);
    return { $$type: 'BountyFactory$Data' as const, owner: _owner, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, bountyCount: _bountyCount, bounties: _bounties };
}

export function loadTupleBountyFactory$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _platformFeeBps = source.readBigNumber();
    const _platformAddress = source.readAddress();
    const _bountyCount = source.readBigNumber();
    const _bounties = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    return { $$type: 'BountyFactory$Data' as const, owner: _owner, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, bountyCount: _bountyCount, bounties: _bounties };
}

export function loadGetterTupleBountyFactory$Data(source: TupleReader) {
    const _owner = source.readAddress();
    const _platformFeeBps = source.readBigNumber();
    const _platformAddress = source.readAddress();
    const _bountyCount = source.readBigNumber();
    const _bounties = Dictionary.loadDirect(Dictionary.Keys.BigInt(257), Dictionary.Values.Address(), source.readCellOpt());
    return { $$type: 'BountyFactory$Data' as const, owner: _owner, platformFeeBps: _platformFeeBps, platformAddress: _platformAddress, bountyCount: _bountyCount, bounties: _bounties };
}

export function storeTupleBountyFactory$Data(source: BountyFactory$Data) {
    const builder = new TupleBuilder();
    builder.writeAddress(source.owner);
    builder.writeNumber(source.platformFeeBps);
    builder.writeAddress(source.platformAddress);
    builder.writeNumber(source.bountyCount);
    builder.writeCell(source.bounties.size > 0 ? beginCell().storeDictDirect(source.bounties, Dictionary.Keys.BigInt(257), Dictionary.Values.Address()).endCell() : null);
    return builder.build();
}

export function dictValueParserBountyFactory$Data(): DictionaryValue<BountyFactory$Data> {
    return {
        serialize: (src, builder) => {
            builder.storeRef(beginCell().store(storeBountyFactory$Data(src)).endCell());
        },
        parse: (src) => {
            return loadBountyFactory$Data(src.loadRef().beginParse());
        }
    }
}

 type BountyFactory_init_args = {
    $$type: 'BountyFactory_init_args';
    platformFeeBps: bigint;
    platformAddress: Address;
}

function initBountyFactory_init_args(src: BountyFactory_init_args) {
    return (builder: Builder) => {
        const b_0 = builder;
        b_0.storeInt(src.platformFeeBps, 257);
        b_0.storeAddress(src.platformAddress);
    };
}

async function BountyFactory_init(platformFeeBps: bigint, platformAddress: Address) {
    const __code = Cell.fromHex('b5ee9c72410262010018240002feff008e88f4a413f4bcf2c80bed53208eea3001d072d721d200d200fa4021103450666f04f86102f862ed44d0d200018e1cfa40810101d700fa40d401d0810101d700f404301025102410236c158e10810101d700fa405902d101f84259706de206925f06e004d70d1ff2e08201821095a02766bae3025f06f2c082e1ed43d9010d02027102090201200305017bbb69ded44d0d200018e1cfa40810101d700fa40d401d0810101d700f404301025102410236c158e10810101d700fa405902d101f84259706de2db3c6c518040002220201200607017bb4a3bda89a1a400031c39f481020203ae01f481a803a1020203ae01e80860204a20482046d82b1c21020203ae01f480b205a203f084b2e0dbc5b678d8a3032017bb40cdda89a1a400031c39f481020203ae01f481a803a1020203ae01e80860204a20482046d82b1c21020203ae01f480b205a203f084b2e0dbc5b678d8a30080002230201480a0b017bb472bda89a1a400031c39f481020203ae01f481a803a1020203ae01e80860204a20482046d82b1c21020203ae01f480b205a203f084b2e0dbc5b678d8a3021017fb474bda89a1a400031c39f481020203ae01f481a803a1020203ae01e80860204a20482046d82b1c21020203ae01f480b205a203f084b2e0dbc4aa09b678d8a300c0026810101220259f40c6fa192306ddf206ef2d08001f2d401d001d401d001d430d0d401d001810101d700d401d001d401d001d430d0f8416f24135f035304a9048200cc6a0182080f4240bef2f48200a1ff25c200f2f48200c7ee8b4647261778525001f90101f901ba917f8e118b66d616e75616c8525001f90101f901bae2f2f48200f7108b66d616e75616c852400e02fe01f90101f901ba917f9f8b46175746f8524001f90101f901bae2f2f4f842f823181079541602106a4415103a5422c352c0db3c5c705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d05003716d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e0f60019088c87001ca0055b150bcce09c8ce19cdc808c8ce18cd06c8ce16cd14810101cf0012810101cf0001c8cecdc802c8ce12cd02c8ce12cd13810101cf0013ce13810101cf0012cdcdc9100262ff008e88f4a413f4bcf2c80bed53208e9c30eda2edfb01d072d721d200d200fa4021103450666f04f86102f862e1ed43d9113e0202711229020120131b020120141604fbb4043da89a1a400031d69b678ae30222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d6db67819a2aa14a6ed5208430402a300a8a08340a6034116cc2c6e8d2eccb0dae040da421422201421be219c215a2158215621342112e1c5b678ae20be1f03f41153d0004561502016a171904faab0bed44d0d200018eb4db3c57181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8eb6db3c0cd1550a5376a9042182015180545041a05301a08b661637469766586d70206d210a11100a10df10ce10ad10ac10ab109a108970e2db3c57105f0f3f41183d0004561104faabe4ed44d0d200018eb4db3c57181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8eb6db3c0cd1550a5376a9042182015180545041a05301a08b661637469766586d70206d210a11100a10df10ce10ad10ac10ab109a108970e2db3c57105f0f3f411a3d000456120201201c240201481d220201581e2004f9a63bda89a1a400031d69b678ae30222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d6db67819a2aa14a6ed5208430402a300a8a08340a6034116cc2c6e8d2eccb0dae040da421422201421be219c215a2158215621342112e1c5b678ae20be1f3f411f3d0004561704f9a465da89a1a400031d69b678ae30222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d6db67819a2aa14a6ed5208430402a300a8a08340a6034116cc2c6e8d2eccb0dae040da421422201421be219c215a2158215621342112e1c5b678ae20be1f3f41213d00022104fbac54f6a268690000c75a6d9e2b8c088b088b888b088a888b088a888a088a888a0889888a088988890889888908888889088888880888888807888807aa87475b6d9e0668aa8529bb548210c100a8c02a2820d02980d045b30b1ba34bb32c36b810369085088805086f8867085688560855884d0844b8716d9e2b882f87c03f41233d00045616020120252704fbb10bbb513434800063ad36cf15c604458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3adb6cf0334554294ddaa4108608054601514106814c06822d9858dd1a5d9961b5c081b48428444028437c433842b442b042ac42684225c38b6cf15c417c3e03f41263d00022e04fbb3c3fb513434800063ad36cf15c604458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3adb6cf0334554294ddaa4108608054601514106814c06822d9858dd1a5d9961b5c081b48428444028437c433842b442b042ac42684225c38b6cf15c417c3e03f41283d00022d0201202a380201202b300201662c2e04faa97ded44d0d200018eb4db3c57181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8eb6db3c0cd1550a5376a9042182015180545041a05301a08b661637469766586d70206d210a11100a10df10ce10ad10ac10ab109a108970e2db3c57105f0f3f412d3d00022004faa90aed44d0d200018eb4db3c57181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8eb6db3c0cd1550a5376a9042182015180545041a05301a08b661637469766586d70206d210a11100a10df10ce10ad10ac10ab109a108970e2db3c57105f0f3f412f3d000226020120313304fbb39bbb513434800063ad36cf15c604458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3adb6cf0334554294ddaa4108608054601514106814c06822d9858dd1a5d9961b5c081b48428444028437c433842b442b042ac42684225c38b6cf15c417c3e03f41323d000224020166343604f9a63fda89a1a400031d69b678ae30222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d6db67819a2aa14a6ed5208430402a300a8a08340a6034116cc2c6e8d2eccb0dae040da421422201421be219c215a2158215621342112e1c5b678ae20be1f3f41353d0004561304f9a605da89a1a400031d69b678ae30222c222e222c222a222c222a2228222a22282226222822262224222622242222222422222220222222201e22201eaa1d1d6db67819a2aa14a6ed5208430402a300a8a08340a6034116cc2c6e8d2eccb0dae040da421422201421be219c215a2158215621342112e1c5b678ae20be1f3f41373d00045614020148393b04fbb1bbfb513434800063ad36cf15c604458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3adb6cf0334554294ddaa4108608054601514106814c06822d9858dd1a5d9961b5c081b48428444028437c433842b442b042ac42684225c38b6cf15c417c3e03f413a3d00022704fbb23e3b513434800063ad36cf15c604458445c4458445444584454445044544450444c4450444c4448444c44484444444844444440444444403c44403d543a3adb6cf0334554294ddaa4108608054601514106814c06822d9858dd1a5d9961b5c081b48428444028437c433842b442b042ac42684225c38b6cf15c417c3e03f413c3d00022800046c8103fced44d0d200018eb4db3c57181116111711161115111611151114111511141113111411131112111311121111111211111110111111100f11100f550e8eb6db3c0cd1550a5376a9042182015180545041a05301a08b661637469766586d70206d210a11100a10df10ce10ad10ac10ab109a108970e21119945f0f5f0ae0703f414201f0fa40d401d001d401d0d401d001d401d001810101d700810101d700810101d700d430d0810101d700fa40d401d001d401d001d401d001810101d700d430d0810101d700810101d700810101d700d430d0810101d700d401d001f404810101d700810101d700f404d430d0810101d700d2003011161118111640000c1116111711160076fa40d401d001d401d0d401d001d401d001810101d700810101d700d401d001d430d0d401d001d401d001810101d700fa40810101d7003010ac10ab03ce5618d74920c21fe30001c00001c121b08ed057171115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df551cc87f01ca0011181117111611151114111311121111111055e0db3cc9ed54e01117f901435e540456311118d31f218210143ea1babae302218210685a38b6bae302218210920c0b5abae302218210cf6ffcfdba4446484b01fe3157181117d430d08200f9f08b66163746976658527001f90101f901baf2f482008ffbf82329bbf2f4f842f823245033700443138101015025c855405045810101cf0012ce01c8cecd810101cf00ca00c923103601206e953059f45a30944133f415e201a402a41115111711151114111611141113111511131112111411124501941111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105704435601c87f01ca0011181117111611151114111311121111111055e0db3cc9ed54db315e01fa3157181117810101d7003082008aabf842561801c705f2f482009ad08b66163746976658527001f90101f901ba917f8e118b67265766965778527001f90101f901bae2f2f4248101012259f40d6fa192306ddf206e92306d8e19d0810101d700fa40d401d001810101d700d20055406c156f05e28200ec19216eb3f2f44701fc206ef2d0806f253010237f44148101015025c855405045810101cf0012ce01c8cecd810101cf00ca00c9103612206e953059f45a30944133f415e21115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710464435124a01fa3157181117810101d7003082008aabf842561801c705f2f482009ad08b66163746976658527001f90101f901ba917f8e118b67265766965778527001f90101f901bae2f2f4248101012259f40d6fa192306ddf206e92306d8e19d0810101d700fa40d401d001810101d700d20055406c156f05e28200ec19216eb3f2f44901fc206ef2d0806f253010237044148101015025c855405045810101cf0012ce01c8cecd810101cf00ca00c9103612206e953059f45a30944133f415e21115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105710464435124a0140c87f01ca0011181117111611151114111311121111111055e0db3cc9ed54db315e0330e30221821006a68ba9bae3022182105384f23ebae30211194c505202fc57195b57171115810101d700f4043082008aabf842561701c705f2f4820097138b66d616e75616c852e001f90101f901baf2f4816b658b672657669657781601f90101f901ba15f2f453eda8812710a90453f0a15112a852e0736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf818ae24d4e001a58cf8680cf8480f400f400cf8101fcf400c901fb0070228e65258101012259f40c6fa192306ddf206ef2d080111981010122561b206e953059f45a30944133f414e2111922736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb00a4e45b337f8b9636f6d706c6574656484f01c81115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a107910681057061035441359c87f01ca0011181117111611151114111311121111111055e0db3cc9ed54db315e01f45b571782008aabf842561701c705f2f48200e4498b661637469766581601f90101f901ba15f2f456145611736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb008b963616e63656c6c656481115111711151114111611145101ae1113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a1079106810570610354403c87f01ca0011181117111611151114111311121111111055e0db3cc9ed54db315e01f65b57178200e5a25618f2f482008aabf842561701c705f2f42f5617a8561201a120c2008e3b561601736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb009130e21115111711151114111611141113111511131112111411125301701111111311111110111211100f11110f0e11100e10df551cc87f01ca0011181117111611151114111311121111111055e0db3cc9ed54db315e015682e8e0d8b11c4d4a9dacaeb3b6a01cd757d3bd7b06de9c4482ca16153ad8cf2de8bae3025f0f5f09f2c0825503fe82009d4df82327bcf2f4811bac8b66163746976658526001f90101f901ba92357f8e108b672657669657781601f90101f901bae215f2f48200dc905617b3f2f46d7053038ae43020e303571757172f5616b60853fea8812710a904561021a15112a852f0736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c56575900c8258101012259f40d6fa192306ddf206e92306d8e19d0810101d700fa40d401d001810101d700d20055406c156f05e2206eb38e2c206ef2d0806f256c318e1e810101201035544433216e955b59f45a3098c801cf004133f442e201a4589130e29130e2a401fc5b56145611736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb008b963616e63656c6c656481115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b580156108a1079106810570610354403c87f01ca0011181117111611151114111311121111111055e0db3cc9ed545e02ec6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb006d70038ae45b571657167f8b9636f6d706c6574656481115111711151114111611141113111511131112111411121111111311111110111211100f11110f0e11100e10df10ce10bd10ac109b108a10791068105706103544005a5d01e2705619f8446e97f825f8157ff864de21a1f811a081010120561c5422334133f40c6fa19401d70030925b6de2206ef2d080810101280259f40d6fa192306ddf206e92306d8e19d0810101d700fa40d401d001810101d700d20055406c156f05e2206ef2d0806f2510345f042281010123715b01284133f40c6fa19401d70030925b6de26e915be30d5c00d81281010150037f71216e955b59f45a3098c801cf004133f442e2078101015342206e953059f45a30944133f414e25112736d5a6d6d40037fc8cf8580ca00cf8440ce01fa028069cf40025c6e016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0002a44016013cc87f01ca0011181117111611151114111311121111111055e0db3cc9ed545e01f6011117011118ce1115c8ce01111501cdc81114c8ce01111401cd1112c8ce01111201cd01111001810101cf001e810101cf001c810101cf000ac8810101cf0019ce07c8ce17cd05c8ce15cd03c8ce13cd810101cf0001c8810101cf0012810101cf0012810101cf0002c8810101cf0004c8ce14cd14f400148101015f003ccf0014810101cf0015f40005c8810101cf0016ca0014cd12cd12cd12cdcd01c6016eb0935bcf819d58cf8680cf8480f400f400cf81e2f400c901fb0081010102705920f90022f9005ad76501d76582020134c8cb17cb0fcb0fcbffcbff71f90400c87401cb0212ca07cbffc9d025103701206e953059f45a30944133f414e203a4440361003ec87f01ca0055405045ce12810101cf00ce01c8810101cf0012f400cdc9ed5468291d60');
    const builder = beginCell();
    builder.storeUint(0, 1);
    initBountyFactory_init_args({ $$type: 'BountyFactory_init_args', platformFeeBps, platformAddress })(builder);
    const __data = builder.endCell();
    return { code: __code, data: __data };
}

export const BountyFactory_errors = {
    2: { message: "Stack underflow" },
    3: { message: "Stack overflow" },
    4: { message: "Integer overflow" },
    5: { message: "Integer out of expected range" },
    6: { message: "Invalid opcode" },
    7: { message: "Type check error" },
    8: { message: "Cell overflow" },
    9: { message: "Cell underflow" },
    10: { message: "Dictionary error" },
    11: { message: "'Unknown' error" },
    12: { message: "Fatal error" },
    13: { message: "Out of gas error" },
    14: { message: "Virtualization error" },
    32: { message: "Action list is invalid" },
    33: { message: "Action list is too long" },
    34: { message: "Action is invalid or not supported" },
    35: { message: "Invalid source address in outbound message" },
    36: { message: "Invalid destination address in outbound message" },
    37: { message: "Not enough Toncoin" },
    38: { message: "Not enough extra currencies" },
    39: { message: "Outbound message does not fit into a cell after rewriting" },
    40: { message: "Cannot process a message" },
    41: { message: "Library reference is null" },
    42: { message: "Library change action error" },
    43: { message: "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree" },
    50: { message: "Account state size exceeded limits" },
    128: { message: "Null reference exception" },
    129: { message: "Invalid serialization prefix" },
    130: { message: "Invalid incoming message" },
    131: { message: "Constraints error" },
    132: { message: "Access denied" },
    133: { message: "Contract stopped" },
    134: { message: "Invalid argument" },
    135: { message: "Code of a contract was not found" },
    136: { message: "Invalid standard address" },
    138: { message: "Not a basechain address" },
    7084: { message: "Not active/review" },
    27493: { message: "Not in review" },
    35499: { message: "Only owner" },
    36859: { message: "Bounty ended" },
    38675: { message: "Not manual selection" },
    39632: { message: "Not in review period" },
    40269: { message: "Review window not over" },
    41471: { message: "Must have at least 1 winner" },
    51182: { message: "Invalid selection" },
    52330: { message: "Per-winner payout too low" },
    56464: { message: "Already paid out" },
    58441: { message: "Can only cancel active bounty" },
    58786: { message: "Payout not done" },
    60441: { message: "Submission not found" },
    63248: { message: "Invalid verification" },
    63984: { message: "Bounty not active" },
} as const

export const BountyFactory_errors_backward = {
    "Stack underflow": 2,
    "Stack overflow": 3,
    "Integer overflow": 4,
    "Integer out of expected range": 5,
    "Invalid opcode": 6,
    "Type check error": 7,
    "Cell overflow": 8,
    "Cell underflow": 9,
    "Dictionary error": 10,
    "'Unknown' error": 11,
    "Fatal error": 12,
    "Out of gas error": 13,
    "Virtualization error": 14,
    "Action list is invalid": 32,
    "Action list is too long": 33,
    "Action is invalid or not supported": 34,
    "Invalid source address in outbound message": 35,
    "Invalid destination address in outbound message": 36,
    "Not enough Toncoin": 37,
    "Not enough extra currencies": 38,
    "Outbound message does not fit into a cell after rewriting": 39,
    "Cannot process a message": 40,
    "Library reference is null": 41,
    "Library change action error": 42,
    "Exceeded maximum number of cells in the library or the maximum depth of the Merkle tree": 43,
    "Account state size exceeded limits": 50,
    "Null reference exception": 128,
    "Invalid serialization prefix": 129,
    "Invalid incoming message": 130,
    "Constraints error": 131,
    "Access denied": 132,
    "Contract stopped": 133,
    "Invalid argument": 134,
    "Code of a contract was not found": 135,
    "Invalid standard address": 136,
    "Not a basechain address": 138,
    "Not active/review": 7084,
    "Not in review": 27493,
    "Only owner": 35499,
    "Bounty ended": 36859,
    "Not manual selection": 38675,
    "Not in review period": 39632,
    "Review window not over": 40269,
    "Must have at least 1 winner": 41471,
    "Invalid selection": 51182,
    "Per-winner payout too low": 52330,
    "Already paid out": 56464,
    "Can only cancel active bounty": 58441,
    "Payout not done": 58786,
    "Submission not found": 60441,
    "Invalid verification": 63248,
    "Bounty not active": 63984,
} as const

const BountyFactory_types: ABIType[] = [
    {"name":"DataSize","header":null,"fields":[{"name":"cells","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bits","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"refs","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SignedBundle","header":null,"fields":[{"name":"signature","type":{"kind":"simple","type":"fixed-bytes","optional":false,"format":64}},{"name":"signedData","type":{"kind":"simple","type":"slice","optional":false,"format":"remainder"}}]},
    {"name":"StateInit","header":null,"fields":[{"name":"code","type":{"kind":"simple","type":"cell","optional":false}},{"name":"data","type":{"kind":"simple","type":"cell","optional":false}}]},
    {"name":"Context","header":null,"fields":[{"name":"bounceable","type":{"kind":"simple","type":"bool","optional":false}},{"name":"sender","type":{"kind":"simple","type":"address","optional":false}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"raw","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"SendParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"code","type":{"kind":"simple","type":"cell","optional":true}},{"name":"data","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"MessageParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"to","type":{"kind":"simple","type":"address","optional":false}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"DeployParameters","header":null,"fields":[{"name":"mode","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"body","type":{"kind":"simple","type":"cell","optional":true}},{"name":"value","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounce","type":{"kind":"simple","type":"bool","optional":false}},{"name":"init","type":{"kind":"simple","type":"StateInit","optional":false}}]},
    {"name":"StdAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":8}},{"name":"address","type":{"kind":"simple","type":"uint","optional":false,"format":256}}]},
    {"name":"VarAddress","header":null,"fields":[{"name":"workchain","type":{"kind":"simple","type":"int","optional":false,"format":32}},{"name":"address","type":{"kind":"simple","type":"slice","optional":false}}]},
    {"name":"BasechainAddress","header":null,"fields":[{"name":"hash","type":{"kind":"simple","type":"int","optional":true,"format":257}}]},
    {"name":"ChangeOwner","header":2174598809,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"ChangeOwnerOk","header":846932810,"fields":[{"name":"queryId","type":{"kind":"simple","type":"uint","optional":false,"format":64}},{"name":"newOwner","type":{"kind":"simple","type":"address","optional":false}}]},
    {"name":"SubmitProof","header":339648954,"fields":[{"name":"proofUrl","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"ApproveSubmission","header":1750743222,"fields":[{"name":"submissionId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"RejectSubmission","header":2450262874,"fields":[{"name":"submissionId","type":{"kind":"simple","type":"int","optional":false,"format":257}}]},
    {"name":"SelectWinners","header":3480222973,"fields":[{"name":"count","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"winnerIds","type":{"kind":"dict","key":"int","value":"address"}}]},
    {"name":"CancelBounty","header":111578025,"fields":[]},
    {"name":"WithdrawExcess","header":1401221694,"fields":[]},
    {"name":"Submission","header":null,"fields":[{"name":"id","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"submitter","type":{"kind":"simple","type":"address","optional":false}},{"name":"proofUrl","type":{"kind":"simple","type":"string","optional":false}},{"name":"submittedAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"approved","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"BountyEscrow$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"bountyType","type":{"kind":"simple","type":"string","optional":false}},{"name":"poolAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"winnerCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"perWinnerAmount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"platformFeeBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"platformAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"winnerSelection","type":{"kind":"simple","type":"string","optional":false}},{"name":"verification","type":{"kind":"simple","type":"string","optional":false}},{"name":"verificationRule","type":{"kind":"simple","type":"string","optional":false}},{"name":"createdAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"durationSeconds","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reviewWindowSeconds","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"endsAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"reviewEndsAt","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"status","type":{"kind":"simple","type":"string","optional":false}},{"name":"submissions","type":{"kind":"dict","key":"int","value":"Submission","valueFormat":"ref"}},{"name":"submissionCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"nextSubmissionId","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"winners","type":{"kind":"dict","key":"int","value":"address"}},{"name":"winnerCountFinal","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"payoutDone","type":{"kind":"simple","type":"bool","optional":false}}]},
    {"name":"CreateBounty","header":2510301030,"fields":[{"name":"title","type":{"kind":"simple","type":"string","optional":false}},{"name":"description","type":{"kind":"simple","type":"string","optional":false}},{"name":"bountyType","type":{"kind":"simple","type":"string","optional":false}},{"name":"winnerCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"winnerSelection","type":{"kind":"simple","type":"string","optional":false}},{"name":"verification","type":{"kind":"simple","type":"string","optional":false}},{"name":"verificationRule","type":{"kind":"simple","type":"string","optional":false}}]},
    {"name":"BountyFactory$Data","header":null,"fields":[{"name":"owner","type":{"kind":"simple","type":"address","optional":false}},{"name":"platformFeeBps","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"platformAddress","type":{"kind":"simple","type":"address","optional":false}},{"name":"bountyCount","type":{"kind":"simple","type":"int","optional":false,"format":257}},{"name":"bounties","type":{"kind":"dict","key":"int","value":"address"}}]},
]

const BountyFactory_opcodes = {
    "ChangeOwner": 2174598809,
    "ChangeOwnerOk": 846932810,
    "SubmitProof": 339648954,
    "ApproveSubmission": 1750743222,
    "RejectSubmission": 2450262874,
    "SelectWinners": 3480222973,
    "CancelBounty": 111578025,
    "WithdrawExcess": 1401221694,
    "CreateBounty": 2510301030,
}

const BountyFactory_getters: ABIGetter[] = [
    {"name":"bountyCount","methodId":99221,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"platformFeeBps","methodId":90214,"arguments":[],"returnType":{"kind":"simple","type":"int","optional":false,"format":257}},
    {"name":"platformAddress","methodId":79517,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"bountyAddress","methodId":107429,"arguments":[{"name":"index","type":{"kind":"simple","type":"int","optional":false,"format":257}}],"returnType":{"kind":"simple","type":"address","optional":false}},
    {"name":"owner","methodId":83229,"arguments":[],"returnType":{"kind":"simple","type":"address","optional":false}},
]

export const BountyFactory_getterMapping: { [key: string]: string } = {
    'bountyCount': 'getBountyCount',
    'platformFeeBps': 'getPlatformFeeBps',
    'platformAddress': 'getPlatformAddress',
    'bountyAddress': 'getBountyAddress',
    'owner': 'getOwner',
}

const BountyFactory_receivers: ABIReceiver[] = [
    {"receiver":"internal","message":{"kind":"typed","type":"CreateBounty"}},
]


export class BountyFactory implements Contract {
    
    public static readonly storageReserve = 0n;
    public static readonly errors = BountyFactory_errors_backward;
    public static readonly opcodes = BountyFactory_opcodes;
    
    static async init(platformFeeBps: bigint, platformAddress: Address) {
        return await BountyFactory_init(platformFeeBps, platformAddress);
    }
    
    static async fromInit(platformFeeBps: bigint, platformAddress: Address) {
        const __gen_init = await BountyFactory_init(platformFeeBps, platformAddress);
        const address = contractAddress(0, __gen_init);
        return new BountyFactory(address, __gen_init);
    }
    
    static fromAddress(address: Address) {
        return new BountyFactory(address);
    }
    
    readonly address: Address; 
    readonly init?: { code: Cell, data: Cell };
    readonly abi: ContractABI = {
        types:  BountyFactory_types,
        getters: BountyFactory_getters,
        receivers: BountyFactory_receivers,
        errors: BountyFactory_errors,
    };
    
    constructor(address: Address, init?: { code: Cell, data: Cell }) {
        this.address = address;
        this.init = init;
    }
    
    async send(provider: ContractProvider, via: Sender, args: { value: bigint, bounce?: boolean| null | undefined }, message: CreateBounty) {
        
        let body: Cell | null = null;
        if (message && typeof message === 'object' && !(message instanceof Slice) && message.$$type === 'CreateBounty') {
            body = beginCell().store(storeCreateBounty(message)).endCell();
        }
        if (body === null) { throw new Error('Invalid message type'); }
        
        await provider.internal(via, { ...args, body: body });
        
    }
    
    async getBountyCount(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('bountyCount', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getPlatformFeeBps(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('platformFeeBps', builder.build())).stack;
        const result = source.readBigNumber();
        return result;
    }
    
    async getPlatformAddress(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('platformAddress', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getBountyAddress(provider: ContractProvider, index: bigint) {
        const builder = new TupleBuilder();
        builder.writeNumber(index);
        const source = (await provider.get('bountyAddress', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
    async getOwner(provider: ContractProvider) {
        const builder = new TupleBuilder();
        const source = (await provider.get('owner', builder.build())).stack;
        const result = source.readAddress();
        return result;
    }
    
}