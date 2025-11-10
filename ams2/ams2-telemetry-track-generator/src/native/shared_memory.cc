// shared_memory.cc - Native C++ addon for reading shared memory

#include <napi.h>
#include <windows.h>
#include <iostream>
#include <string>
#include <chrono>

// Constants matching the game's shared memory format
const int STRING_LENGTH_MAX = 64;
const int STORED_PARTICIPANTS_MAX = 64;
const int TYRE_MAX = 4;
const int VEC_MAX = 3;

// Simplified participant structure
struct ParticipantInfo {
    bool mIsActive;
    char mName[STRING_LENGTH_MAX];
    float mWorldPosition[VEC_MAX];
    float mCurrentLapDistance;
    unsigned int mRacePosition;
    unsigned int mLapsCompleted;
    unsigned int mCurrentLap;
    int mCurrentSector;
};

// Simplified shared memory structure (subset of full structure)
struct SharedMemoryData {
    unsigned int mVersion;
    unsigned int mBuildVersionNumber;
    unsigned int mGameState;
    unsigned int mSessionState;
    unsigned int mRaceState;
    int mViewedParticipantIndex;
    int mNumParticipants;
    ParticipantInfo mParticipantInfo[STORED_PARTICIPANTS_MAX];

    float mSpeed;
    float mRpm;
    float mMaxRPM;
    int mGear;
    int mNumGears;

    char mTrackLocation[STRING_LENGTH_MAX];
    char mTrackVariation[STRING_LENGTH_MAX];
    float mTrackLength;

    float mCurrentTime;
    float mEventTimeRemaining;

    float mSplitTimeAhead;
    float mSplitTimeBehind;

    unsigned int mHighestFlagColour;
    unsigned int mHighestFlagReason;

    float mFuelLevel;
    float mFuelCapacity;

    float mRainDensity;

    float mSpeeds[STORED_PARTICIPANTS_MAX];
    unsigned int mPitModes[STORED_PARTICIPANTS_MAX];

    unsigned int mSequenceNumber;
};

class SharedMemoryReader : public Napi::ObjectWrap<SharedMemoryReader> {
public:
    static Napi::Object Init(Napi::Env env, Napi::Object exports);
    SharedMemoryReader(const Napi::CallbackInfo& info);
    ~SharedMemoryReader();

private:
    static Napi::FunctionReference constructor;

    Napi::Value Connect(const Napi::CallbackInfo& info);
    Napi::Value Read(const Napi::CallbackInfo& info);
    Napi::Value Disconnect(const Napi::CallbackInfo& info);
    Napi::Value IsConnected(const Napi::CallbackInfo& info);

    HANDLE hMapFile = nullptr;
    void* pBuf = nullptr;
    bool connected = false;
};

Napi::FunctionReference SharedMemoryReader::constructor;

Napi::Object SharedMemoryReader::Init(Napi::Env env, Napi::Object exports) {
    Napi::HandleScope scope(env);

    Napi::Function func = DefineClass(env, "SharedMemoryReader", {
        InstanceMethod("connect", &SharedMemoryReader::Connect),
        InstanceMethod("read", &SharedMemoryReader::Read),
        InstanceMethod("disconnect", &SharedMemoryReader::Disconnect),
        InstanceMethod("isConnected", &SharedMemoryReader::IsConnected)
    });

    constructor = Napi::Persistent(func);
    constructor.SuppressDestruct();

    exports.Set("SharedMemoryReader", func);
    return exports;
}

SharedMemoryReader::SharedMemoryReader(const Napi::CallbackInfo& info)
    : Napi::ObjectWrap<SharedMemoryReader>(info) {
}

SharedMemoryReader::~SharedMemoryReader() {
    if (connected) {
        if (pBuf) {
            UnmapViewOfFile(pBuf);
            pBuf = nullptr;
        }
        if (hMapFile) {
            CloseHandle(hMapFile);
            hMapFile = nullptr;
        }
        connected = false;
    }
}

Napi::Value SharedMemoryReader::Connect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (connected) {
        return Napi::Boolean::New(env, true);
    }

    // Open shared memory mapping (AMS2/pCARS2 format)
    hMapFile = OpenFileMappingA(
        FILE_MAP_READ,
        FALSE,
        "$pcars2$"
    );

    if (hMapFile == nullptr) {
        Napi::TypeError::New(env, "Failed to open shared memory").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    pBuf = MapViewOfFile(
        hMapFile,
        FILE_MAP_READ,
        0,
        0,
        sizeof(SharedMemoryData)
    );

    if (pBuf == nullptr) {
        CloseHandle(hMapFile);
        hMapFile = nullptr;
        Napi::TypeError::New(env, "Failed to map view of file").ThrowAsJavaScriptException();
        return Napi::Boolean::New(env, false);
    }

    connected = true;
    return Napi::Boolean::New(env, true);
}

Napi::Value SharedMemoryReader::Read(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (!connected || pBuf == nullptr) {
        Napi::TypeError::New(env, "Not connected to shared memory").ThrowAsJavaScriptException();
        return env.Null();
    }

    // Read data from shared memory
    SharedMemoryData* data = static_cast<SharedMemoryData*>(pBuf);

    // Create JavaScript object
    Napi::Object result = Napi::Object::New(env);

    // Game state
    result.Set("gameState", Napi::Number::New(env, data->mGameState));
    result.Set("sessionState", Napi::Number::New(env, data->mSessionState));
    result.Set("raceState", Napi::Number::New(env, data->mRaceState));
    result.Set("viewedParticipantIndex", Napi::Number::New(env, data->mViewedParticipantIndex));

    // Participants
    result.Set("numParticipants", Napi::Number::New(env, data->mNumParticipants));
    Napi::Array participants = Napi::Array::New(env);

    for (int i = 0; i < data->mNumParticipants && i < STORED_PARTICIPANTS_MAX; i++) {
        // Include ALL participants, not just active ones - world positions might be there
        // if (!data->mParticipantInfo[i].mIsActive) continue;

        Napi::Object participant = Napi::Object::New(env);
        participant.Set("index", Napi::Number::New(env, i));
        participant.Set("isActive", Napi::Boolean::New(env, data->mParticipantInfo[i].mIsActive));
        participant.Set("name", Napi::String::New(env, data->mParticipantInfo[i].mName));
        participant.Set("racePosition", Napi::Number::New(env, data->mParticipantInfo[i].mRacePosition));
        participant.Set("currentLap", Napi::Number::New(env, data->mParticipantInfo[i].mCurrentLap));
        participant.Set("lapsCompleted", Napi::Number::New(env, data->mParticipantInfo[i].mLapsCompleted));
        participant.Set("currentLapDistance", Napi::Number::New(env, data->mParticipantInfo[i].mCurrentLapDistance));
        participant.Set("speed", Napi::Number::New(env, data->mSpeeds[i]));
        participant.Set("pitMode", Napi::Number::New(env, data->mPitModes[i]));
        
        // World position [X, Y, Z]
        Napi::Array worldPos = Napi::Array::New(env, 3);
        worldPos.Set(uint32_t(0), Napi::Number::New(env, data->mParticipantInfo[i].mWorldPosition[0]));
        worldPos.Set(uint32_t(1), Napi::Number::New(env, data->mParticipantInfo[i].mWorldPosition[1]));
        worldPos.Set(uint32_t(2), Napi::Number::New(env, data->mParticipantInfo[i].mWorldPosition[2]));
        participant.Set("worldPosition", worldPos);

        participants.Set(participants.Length(), participant);
    }
    result.Set("participants", participants);

    // Player car data
    result.Set("speed", Napi::Number::New(env, data->mSpeed));
    result.Set("rpm", Napi::Number::New(env, data->mRpm));
    result.Set("maxRPM", Napi::Number::New(env, data->mMaxRPM));
    result.Set("gear", Napi::Number::New(env, data->mGear));
    result.Set("numGears", Napi::Number::New(env, data->mNumGears));

    // Track
    result.Set("trackLocation", Napi::String::New(env, data->mTrackLocation));
    result.Set("trackVariation", Napi::String::New(env, data->mTrackVariation));
    result.Set("trackLength", Napi::Number::New(env, data->mTrackLength));

    // Timing
    result.Set("currentTime", Napi::Number::New(env, data->mCurrentTime));
    result.Set("eventTimeRemaining", Napi::Number::New(env, data->mEventTimeRemaining));

    // Gaps
    result.Set("splitTimeAhead", Napi::Number::New(env, data->mSplitTimeAhead));
    result.Set("splitTimeBehind", Napi::Number::New(env, data->mSplitTimeBehind));

    // Flags
    result.Set("highestFlagColor", Napi::Number::New(env, data->mHighestFlagColour));
    result.Set("highestFlagReason", Napi::Number::New(env, data->mHighestFlagReason));

    // Fuel
    result.Set("fuelLevel", Napi::Number::New(env, data->mFuelLevel));
    result.Set("fuelCapacity", Napi::Number::New(env, data->mFuelCapacity));

    // Weather
    result.Set("rainDensity", Napi::Number::New(env, data->mRainDensity));

    // Metadata
    result.Set("sequenceNumber", Napi::Number::New(env, data->mSequenceNumber));
    result.Set("timestamp", Napi::Number::New(env, static_cast<double>(
        std::chrono::duration_cast<std::chrono::milliseconds>(
            std::chrono::system_clock::now().time_since_epoch()
        ).count()
    )));

    return result;
}

Napi::Value SharedMemoryReader::Disconnect(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();

    if (pBuf) {
        UnmapViewOfFile(pBuf);
        pBuf = nullptr;
    }

    if (hMapFile) {
        CloseHandle(hMapFile);
        hMapFile = nullptr;
    }

    connected = false;
    return Napi::Boolean::New(env, true);
}

Napi::Value SharedMemoryReader::IsConnected(const Napi::CallbackInfo& info) {
    Napi::Env env = info.Env();
    return Napi::Boolean::New(env, connected);
}

Napi::Object Init(Napi::Env env, Napi::Object exports) {
    return SharedMemoryReader::Init(env, exports);
}

NODE_API_MODULE(shared_memory_reader, Init)

